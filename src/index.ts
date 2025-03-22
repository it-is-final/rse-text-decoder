//! SPDX-License-Identifier: MIT
/* 
 * © final 2025.
 * rse-text-decoder is under the MIT License, read the LICENSE file
 * for more information.
 */

'use strict';

import { BoxNames } from "./BoxNames";
import { GameLanguage, GameVersion, isGameLanguage, isGameVersion } from "./types";

document.addEventListener("DOMContentLoaded", function () {
    const boxNames = new BoxNames();
    const getLangFromSelect = () => {
        return document.querySelector<HTMLSelectElement>("#lang-input").value;
    };
    const getVersionFromSelect = () => {
        return document.querySelector<HTMLSelectElement>("#game-version-input").value;
    };

    function updateByteViews() {
        const a = boxNames.getByteStream();
        const l: string[] = [];
        document.querySelector<HTMLTextAreaElement>("#box-name-byte-view")
        .value = boxNames.boxNames.map(
            row => (
                [...row].map(
                    chr => chr.toString(16).toUpperCase().padStart(2, "0")
                ).join(" ")
            )
        ).join("\n");
        document.querySelector<HTMLTextAreaElement>("#uint-view")
        .value = (() => {
            let byteLength: 2 | 4;
            let endianness: "little" | "big";
            if (!(
                document.querySelector<HTMLInputElement>("#u16-radio").checked
                || document.querySelector<HTMLInputElement>("#u32-radio").checked
            )) {
                throw new Error("Unconfigured bit length");
            } else {
                if (document.querySelector<HTMLInputElement>("#u16-radio").checked) {
                    byteLength = 2;
                }
                if (document.querySelector<HTMLInputElement>("#u32-radio").checked) {
                    byteLength = 4;
                }
            }
            if (!(
                document.querySelector<HTMLInputElement>("#little-endian-radio").checked
                || document.querySelector<HTMLInputElement>("#big-endian-radio").checked
            )) {
                throw new Error("Unconfigured endianness");
            } else {
                if (document.querySelector<HTMLInputElement>("#little-endian-radio").checked) {
                    endianness = "little";
                }
                if (document.querySelector<HTMLInputElement>("#big-endian-radio").checked) {
                    endianness = "big";
                }
            }
            if (endianness === "little") {
                for (
                    let i = 0;
                    i < (a.length - (a.length % byteLength));
                    i += byteLength
                ) {
                    let x = "";
                    for (let j = 0; j < byteLength; j++) {
                        x += a[i+j].toString(16).toUpperCase().padStart(2, "0");
                    }
                    l.push(x);
                }
            }
            if (endianness === "big") {
                for (
                    let i = 0;
                    i < (a.length - (a.length % byteLength));
                    i += byteLength
                ) {
                    let x = "";
                    for (let j = byteLength - 1; j >= 0; j--) {
                        x += a[i+j].toString(16).toUpperCase().padStart(2, "0");
                    }
                    l.push(x)
                }
            }
            return l.join("\n");
        })();
        document.querySelector<HTMLTextAreaElement>("#code-gen-view")
        .value = (() => {
            const a = boxNames.getByteStream();
            const l: string[] = [];
            for (let i = 0; i < (a.length - (a.length % 4)); i += 4) {
                const x = a[i] | a[i+1] << 8 | a[i+2] << 16 | a[i+3] << 24;
                l.push(("0x" + (x >>> 0).toString(16).toUpperCase().padStart(8, "0")));
            }
            return l.join("\n");
        })();
    }

    function updateBoxNameInputs(version: GameVersion, language: GameLanguage) {
        const sBoxNames = boxNames.getStringNames(version, language);
        for (
            const [i, boxInput] of
            document.querySelectorAll<HTMLInputElement>(".box-name-input").entries()
        ) {
            boxInput.value = sBoxNames[i];
        }
    }

    function setActiveTab(this: HTMLButtonElement, tabPanel: HTMLDivElement) {
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
        this.classList.add("active");
        tabPanel.style.display = "block";
    }

    document.querySelector<HTMLTextAreaElement>("#box-name-byte-view")
    .addEventListener("input", function() {
        const v = getVersionFromSelect();
        const l = getLangFromSelect();
        if (!isGameVersion(v)) {
            return;
        }
        if (!isGameLanguage(l)) {
            return
        }
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
        const bytes: number[] = [];
        for (let i = 0; i < BOX_NAMES_NIBBLE_LENGTH; i += 2) {
            const x = parseInt(sByteView.slice(i, i+2), 16);
            bytes.push(x);
        }
        boxNames.setNamesFromBytes(bytes);
        updateBoxNameInputs(v, l);
        updateByteViews();
        this.selectionStart = cursePosition;
        this.selectionEnd = cursePosition;
    })

    for (
        const [i, boxInput] of
        document.querySelectorAll<HTMLInputElement>(".box-name-input").entries()
    ) {
        boxInput.addEventListener("input", function() {
            const v = getVersionFromSelect();
            const l = getLangFromSelect();
            if (!isGameVersion(v)) {
                return;
            }
            if (!isGameLanguage(l)) {
                return
            }
            try {
                boxNames.setNameFromString(i, this.value, v, l);
                this.setCustomValidity("");
                updateByteViews();
            } catch(e) {
                this.setCustomValidity(e);
            }
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
        setActiveTab.apply(
            this,
            [document.querySelector<HTMLDivElement>("#raw-view-tab-panel")]
        );
    });
    document.querySelector<HTMLButtonElement>("#uint-view-tab")
    .addEventListener("click", function() {
        setActiveTab.apply(
            this,
            [document.querySelector<HTMLDivElement>("#uint-view-tab-panel")]
        );
    });
    document.querySelector<HTMLButtonElement>("#code-gen-view-tab")
    .addEventListener("click", function() {
        setActiveTab.apply(
            this,
            [document.querySelector<HTMLDivElement>("#code-gen-view-tab-panel")]
        );
    });

    document.querySelector<HTMLSelectElement>("#lang-input")
    .addEventListener(
        "input", () => {
            const v = getVersionFromSelect();
            const l = getLangFromSelect();
            if (!isGameVersion(v)) {
                return;
            }
            if (!isGameLanguage(l)) {
                return;
            }
            updateBoxNameInputs(v, l);
            updateByteViews();
        }
    );
    
    document.querySelector<HTMLSelectElement>("#game-version-input")
    .addEventListener(
        "input", () => {
            const v = getVersionFromSelect();
            const l = getLangFromSelect();
            if (!isGameVersion(v)) {
                return;
            }
            if (!isGameLanguage(l)) {
                return;
            }
            updateBoxNameInputs(v, l);
            updateByteViews();
        }
    );

    (() => {
        const v = getVersionFromSelect();
        const l = getLangFromSelect();
        if (!isGameVersion(v)) {
            return;
        }
        if (!isGameLanguage(l)) {
            return;
        }
        updateBoxNameInputs(v, l);
        updateByteViews();
        setActiveTab.apply(
            document.querySelector<HTMLButtonElement>("#raw-view-tab"),
            [document.querySelector<HTMLDivElement>("#raw-view-tab-panel")],
        )
    })();
})
