//! SPDX-License-Identifier: MIT
/* 
 * © final 2025.
 * rse-text-decoder is under the MIT License, read the LICENSE file
 * for more information.
 */

'use strict';

import { BoxNames } from "./BoxNames";
import {
    GameLanguage,
    GameVersion,
    isGameLanguage,
    isGameVersion
} from "./types";

const byteViews = {
    rawView: document.querySelector<HTMLTextAreaElement>("#box-name-byte-view"),
    uIntView: document.querySelector<HTMLTextAreaElement>("#uint-view"),
    codeGenView: document.querySelector<HTMLTextAreaElement>("#code-gen-view"),
};
const settingControls = {
    languageSelect: document.querySelector<HTMLSelectElement>("#lang-input"),
    versionSelect: document.querySelector<HTMLSelectElement>("#game-version-input"),
};
const uIntViewControls = {
    u16Radio: document.querySelector<HTMLInputElement>("#u16-radio"),
    u32Radio: document.querySelector<HTMLInputElement>("#u32-radio"),
    littleEndianRadio:
        document.querySelector<HTMLInputElement>("#little-endian-radio"),
    bigEndianRadio:
        document.querySelector<HTMLInputElement>("#big-endian-radio"),
};
const boxNameInputs =
    document.querySelectorAll<HTMLInputElement>(".box-name-input");

const boxNames = new BoxNames();

function getLangFromSelect() {
    const l = settingControls.languageSelect.value;
    if (!isGameLanguage(l)) {
        throw new Error("Invalid language");
    }
    return l;
};

function getVersionFromSelect() {
    const v = settingControls.versionSelect.value;
    if (!isGameVersion(v)) {
        throw new Error("Invalid game version");
    }
    return v;
};

function byteToHex(byte: number): string {
    return byte.toString(16)
               .toUpperCase()
               .padStart(2, "0");
}

function updateByteViews() {
    const b = boxNames.getDataAsStream();
    byteViews.rawView.value = boxNames.data.map(
        (boxName) => Array.from(boxName)
                          .map(byteToHex)
                          .join(" ")
    ).join("\n");
    byteViews.uIntView.value = (() => {
        let byteLength: 2 | 4;
        let endianness: "little" | "big";
        const out: string[] = [];
        if (uIntViewControls.u16Radio.checked) {
            byteLength = 2;
        } else if (uIntViewControls.u32Radio.checked) {
            byteLength = 4;
        } else {
            throw new Error("Unconfigured bit length");
        }
        if (uIntViewControls.littleEndianRadio.checked) {
            endianness = "little";
        } else if (uIntViewControls.bigEndianRadio.checked) {
            endianness = "big";
        } else {
            throw new Error("Unconfigured endianness");
        }
        for (
            let i = 0;
            i < (b.length - (b.length % byteLength));
            i += byteLength
        ) {
            const buffer: string[] = Array.from(b.slice(i, i + byteLength))
                                          .map(byteToHex);
            // Everything is in little endian by default
            // Better to make an exception for big endian
            if (endianness === "big") {
                buffer.reverse();
            }
            out.push(buffer.join(""));
        }
        return out.join("\n");
    })();
    byteViews.codeGenView.value = (() => {
        const l: string[] = [];
        for (let i = 0; i < (b.length - (b.length % 4)); i += 4) {
            const x = (b[i+3] << 24) | (b[i+2] << 16)
                      | (b[i+1] << 8) | (b[i] << 0);
            l.push(
                (
                    "0x" + (x >>> 0)
                                .toString(16)
                                .toUpperCase()
                                .padStart(8, "0")
                )
            );
        }
        return l.join("\n");
    })();
}

function updateBoxNameInputs(version: GameVersion, language: GameLanguage) {
    const sBoxNames = boxNames.getStringNames(version, language);
    for (
        const [i, boxInput] of
        boxNameInputs.entries()
    ) {
        boxInput.value = sBoxNames[i];
    }
}

function setActiveTab(tabButton: HTMLButtonElement, tabPanel: HTMLDivElement) {
    const tabs = (
        document.querySelectorAll<HTMLButtonElement>(".tablinks")
    );
    const tabcontents = (
        document.querySelectorAll<HTMLDivElement>(".tabcontent")
    );
    for (const tabcontent of tabcontents) {
        tabcontent.style.display = "none";
    }
    for (const tab of tabs) {
        tab.classList.remove("active");
    }
    tabButton.classList.add("active");
    tabPanel.style.display = "block";
}

byteViews.rawView.addEventListener("input", function() {
    const v = getVersionFromSelect();
    const l = getLangFromSelect();
    const cursePosition = this.selectionStart;
    const BOX_NAMES_NIBBLE_LENGTH = 252; // (9 * 2) * 14 = 252
    const sByteView = this.value.replace(/\s/gm, "").toUpperCase();
    if (
        sByteView.length !== BOX_NAMES_NIBBLE_LENGTH
        || sByteView.match(/[^0-9A-F]/g)
    ) {
        this.setCustomValidity("Illegal state");
        return;
    } else {
        this.setCustomValidity("");
    }
    const bytes = new Uint8Array(14 * 9);
    for (let i = 0; i < sByteView.length; i += 2) {
        const x = parseInt(sByteView.slice(i, i+2), 16);
        bytes[Math.floor(i / 2)] = x;
    }
    boxNames.setNamesFromBytes(bytes);
    updateBoxNameInputs(v, l);
    updateByteViews();
    this.selectionStart = cursePosition;
    this.selectionEnd = cursePosition;
})

for (const [i, boxInput] of boxNameInputs.entries()) {
    boxInput.addEventListener("input", function() {
        try {
            boxNames.setNameFromString(
                i,
                this.value,
                getVersionFromSelect(),
                getLangFromSelect()
            );
            this.setCustomValidity("");
            updateByteViews();
        } catch(e) {
            this.setCustomValidity(e);
        }
        updateBoxNameInputs(getVersionFromSelect(), getLangFromSelect());
    });
}

for (
    const uIntViewParam of
    document.querySelectorAll<HTMLInputElement>(".uint-view-params")
) {
    uIntViewParam.addEventListener("input", () => updateByteViews());
}

document.querySelector<HTMLButtonElement>("#raw-view-tab")
.addEventListener("click", function() {
    setActiveTab(
        this,
        document.querySelector<HTMLDivElement>("#raw-view-tab-panel")
    );
});

document.querySelector<HTMLButtonElement>("#uint-view-tab")
.addEventListener("click", function() {
    setActiveTab(
        this,
        document.querySelector<HTMLDivElement>("#uint-view-tab-panel")
    );
});

document.querySelector<HTMLButtonElement>("#code-gen-view-tab")
.addEventListener("click", function() {
    setActiveTab(
        this,
        document.querySelector<HTMLDivElement>("#code-gen-view-tab-panel")
    );
});

settingControls.languageSelect.addEventListener("input", () => {
    updateBoxNameInputs(getVersionFromSelect(), getLangFromSelect());
    updateByteViews();
});

settingControls.versionSelect.addEventListener("input", () => {
    updateBoxNameInputs(getVersionFromSelect(), getLangFromSelect());
    updateByteViews();
});

document.addEventListener("DOMContentLoaded", function () {
    updateBoxNameInputs(getVersionFromSelect(), getLangFromSelect());
    updateByteViews();
    setActiveTab(
        document.querySelector<HTMLButtonElement>("#raw-view-tab"),
        document.querySelector<HTMLDivElement>("#raw-view-tab-panel"),
    );
})
