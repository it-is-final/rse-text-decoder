//! SPDX-License-Identifier: MIT
/* 
 * © final 2025.
 * rse-text-decoder is under the MIT License, read the LICENSE file
 * for more information.
 */

'use strict';
import { Language, GameVersion } from "./types";
import { characterMaps, reverseCharacterMaps } from "./character-maps";

class BoxNames {
    // Initialised with EOF (0xFF) terminators at the end
    #boxNames = Object.seal([
        new Uint8Array([0, 0, 0, 0, 0, 0, 0, 0, 0xFF]),
        new Uint8Array([0, 0, 0, 0, 0, 0, 0, 0, 0xFF]),
        new Uint8Array([0, 0, 0, 0, 0, 0, 0, 0, 0xFF]),
        new Uint8Array([0, 0, 0, 0, 0, 0, 0, 0, 0xFF]),
        new Uint8Array([0, 0, 0, 0, 0, 0, 0, 0, 0xFF]),
        new Uint8Array([0, 0, 0, 0, 0, 0, 0, 0, 0xFF]),
        new Uint8Array([0, 0, 0, 0, 0, 0, 0, 0, 0xFF]),
        new Uint8Array([0, 0, 0, 0, 0, 0, 0, 0, 0xFF]),
        new Uint8Array([0, 0, 0, 0, 0, 0, 0, 0, 0xFF]),
        new Uint8Array([0, 0, 0, 0, 0, 0, 0, 0, 0xFF]),
        new Uint8Array([0, 0, 0, 0, 0, 0, 0, 0, 0xFF]),
        new Uint8Array([0, 0, 0, 0, 0, 0, 0, 0, 0xFF]),
        new Uint8Array([0, 0, 0, 0, 0, 0, 0, 0, 0xFF]),
        new Uint8Array([0, 0, 0, 0, 0, 0, 0, 0, 0xFF]),
    ]);

    toStringNames(gameVersion: GameVersion, language: Language) {
        // The character maps are based on what is found in Emerald version
        // As a result, modifications must be made for R/S and FR/LG
        const characterMap = new Map(characterMaps[language]);
        switch (gameVersion) {
            case "RS":
                characterMap.set(0xB0, "‥");
                characterMap.set(0xF7, "↑");
                characterMap.set(0xF8, "↓");
                characterMap.set(0xF9, "←");
                if (gameLanguage !== "JPN") {
                    characterMap.delete(0x50);
                    characterMap.delete(0x7D);
                    characterMap.delete(0x7E);
                    characterMap.delete(0x7F);
                    characterMap.delete(0x80);
                    characterMap.delete(0x81);
                    characterMap.delete(0x82);
                    characterMap.delete(0x83);
                    for (let i = 0xA; i <= 0x9F; i++) {
                        if (!characterMap.has(i)) {
                            // Fill with Japanese characters
                            characterMap.set(
                                i, characterMaps["JPN"].get(i) ?? " "
                            );
                        }
                    }
                }
                break;
            case "FRLG":
                if (gameLanguage === "JPN") {
                    characterMap.set(0xb0, "…");
                }
                if (gameLanguage !== "JPN") {
                    characterMap.delete(0x50);
                    characterMap.delete(0x7D);
                    characterMap.delete(0x7E);
                    characterMap.delete(0x7F);
                    characterMap.delete(0x80);
                    characterMap.delete(0x81);
                    characterMap.delete(0x82);
                    characterMap.delete(0x83);
                }
                break;
            case "E":
                break;
        }
        const sBoxNames = this.#boxNames.map(
            boxName => [...boxName].map(
                bNameChrIdx => characterMap.get(bNameChrIdx) ?? " "
            ).join("").split("\0")[0]
        );
        return sBoxNames;
    }

    toByteView() {
        return this.#boxNames;
    }

    editBoxNameFromString(
        boxNNumber: number,
        sInput: string,
        gameVersion: GameVersion,
        language: Language
    ) {
        const referenceMap = new Map(characterMaps[language]);
        const reverseCharMap = new Map(reverseCharacterMaps[language]);
        if (gameVersion === "RS") {
            reverseCharMap.set("↑", 0xF7);
            reverseCharMap.set("↓", 0xF8);
            reverseCharMap.set("←", 0xF9);
            if (gameLanguage !== "JPN") {
                reverseCharMap.delete("▯");
                reverseCharMap.delete("*");
                referenceMap.delete(0x50);
                referenceMap.delete(0x7D);
                referenceMap.delete(0x7E);
                referenceMap.delete(0x7F);
                referenceMap.delete(0x80);
                referenceMap.delete(0x81);
                referenceMap.delete(0x82);
                referenceMap.delete(0x83);
                for (let i = 0xA; i <= 0x9F; i++) {
                    if (!referenceMap.has(i)) {
                        reverseCharMap.set(characterMaps["JPN"].get(i), i);
                    }
                }
            }
        }
        if (gameVersion === "FRLG") {
            if (gameLanguage !== "JPN") {
                reverseCharMap.delete("▯");
                reverseCharMap.delete("*");
            }
        }
        // Length of the box name is always 9
        for (let i = 0; i < 9; i++) {
            const c = sInput.charAt(i);
            if (c === "") {
                this.#boxNames[boxNNumber][i] = 0xFF;
            } else if (reverseCharMap.has(c)) {
                this.#boxNames[boxNNumber][i] = reverseCharMap.get(c);
            } else {
                throw new Error("Invalid character");
            }
        }
    }

    editBoxNameFromBytes(
        boxNNumber: number,
        bBoxName: number[]
    ) {
        if (bBoxName.length !== 9) {
            throw new Error("Malformed bytearray");
        }
        for (let chrIdx = 0; chrIdx < 9; chrIdx++) {
            this.#boxNames[boxNNumber][chrIdx] = bBoxName[chrIdx];
        }
    }

    fromByteView(byteView: number[]) {
        if (byteView.length !== (14 * 9)) {
            throw new Error("Malformed bytearray");
        }
        let bArrIdx = 0;
        for (let bNNum = 0; bNNum < 14; bNNum++) {
            for (let chrIdx = 0; chrIdx < 9; chrIdx++) {
                this.#boxNames[bNNum][chrIdx] = byteView[bArrIdx++];
            }
        }
    }
}

const boxNames = new BoxNames();
const boxNamesByteView =
    document.getElementById("box-name-byte-view") as HTMLTextAreaElement;
const codeGeneratorView =
    document.getElementById("code-gen-view") as HTMLTextAreaElement;
const gameLanguageInput =
    document.getElementById("lang-input") as HTMLSelectElement;
const gameVersionInput =
    document.getElementById("game-version-input") as HTMLSelectElement;
const boxNameInputs = Object.freeze(
    [
        (document.getElementById("box-1-input") as HTMLInputElement),
        (document.getElementById("box-2-input") as HTMLInputElement),
        (document.getElementById("box-3-input") as HTMLInputElement),
        (document.getElementById("box-4-input") as HTMLInputElement),
        (document.getElementById("box-5-input") as HTMLInputElement),
        (document.getElementById("box-6-input") as HTMLInputElement),
        (document.getElementById("box-7-input") as HTMLInputElement),
        (document.getElementById("box-8-input") as HTMLInputElement),
        (document.getElementById("box-9-input") as HTMLInputElement),
        (document.getElementById("box-10-input") as HTMLInputElement),
        (document.getElementById("box-11-input") as HTMLInputElement),
        (document.getElementById("box-12-input") as HTMLInputElement),
        (document.getElementById("box-13-input") as HTMLInputElement),
        (document.getElementById("box-14-input") as HTMLInputElement),
    ]);
let gameLanguage: Language;
let gameVersion: GameVersion;

function changeAllBoxNames(sBoxNames: string[]) {
    for (const [i, boxNameInput] of boxNameInputs.entries()) {
        boxNameInput.value = sBoxNames[i];
    }
}

function updateByteView(bytes: Uint8Array<ArrayBuffer>[]) {
    boxNamesByteView.value = bytes.map(
        row => (
            [...row].map(
                chr => chr.toString(16).toUpperCase().padStart(2, "0")
            ).join(" ")
        )
    ).join("\n");
}

function updateCodeGenView(
    bytes: Uint8Array<ArrayBuffer>[]
) {
    const a = bytes.map(row => [...row]).flat();
    const l: string[] = [];
    for (let i = 0; i < (a.length - (a.length % 4)); i += 4) {
        const x = a[i] | a[i+1] << 8 | a[i+2] << 16 | a[i+3] << 24;
        l.push(("0x" + (x >>> 0).toString(16).toUpperCase().padStart(8, "0")));
    }
    codeGeneratorView.value = l.join("\n");
}

function setGameLanguage(this: HTMLOptionElement) {
    if (!(
        this.value === "JPN"
        || this.value === "ENG"
        || this.value === "FRA"
        || this.value === "ITA"
        || this.value === "GER"
        || this.value === "SPA"
    )) {
        throw new Error("Unknown language");
    }
    gameLanguage = this.value;
    changeAllBoxNames(boxNames.toStringNames(gameVersion, gameLanguage));
}

function setGameVersion(this: HTMLOptionElement) {
    if (!(
        this.value === "RS"
        || this.value === "FRLG"
        || this.value === "E"
    )) {
        throw new Error("Unknown game version");
    }
    gameVersion = this.value;
    changeAllBoxNames(boxNames.toStringNames(gameVersion, gameLanguage));
}

function setActiveTab(this: HTMLButtonElement, tabContentId: string) {
    const tabs = (
        document.getElementsByClassName("tablinks") as
        HTMLCollectionOf<HTMLButtonElement>
    );
    const tabcontents = (
        document.getElementsByClassName("tabcontent") as
        HTMLCollectionOf<HTMLDivElement>
    );
    for (const tabcontent of tabcontents) {
        tabcontent.style.display = "none";
    }
    for (const tab of tabs) {
        tab.classList.remove("active");
    }
    this.classList.add("active");
    (
        document.getElementById(tabContentId) as
        HTMLDivElement
    ).style.display = "block";
}

gameLanguageInput.addEventListener("input", setGameLanguage);
gameVersionInput.addEventListener("input", setGameVersion);

for (const [i, boxNameInput] of boxNameInputs.entries()) {
    boxNameInput.addEventListener("input", function () {
        try {
            boxNames.editBoxNameFromString(i, this.value, gameVersion, gameLanguage);
            this.setCustomValidity(""); // Blank error message marks field as valid
            updateByteView(boxNames.toByteView());
            updateCodeGenView(boxNames.toByteView());
        } catch (e) {
            this.setCustomValidity(e);
        }
    });
}

boxNamesByteView.addEventListener("input", function () {
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
    const newByteView: number[] = [];
    for (let i = 0; i < BOX_NAMES_NIBBLE_LENGTH; i += 2) {
        const x = parseInt(sByteView.slice(i, i+2), 16);
        newByteView.push(x);
    }
    boxNames.fromByteView(newByteView);
    changeAllBoxNames(boxNames.toStringNames(gameVersion, gameLanguage));
    updateByteView(boxNames.toByteView());
    updateCodeGenView(boxNames.toByteView());
    this.selectionStart = cursePosition;
    this.selectionEnd = cursePosition;
});

(document.getElementById("raw-view-tab") as HTMLButtonElement).addEventListener(
    "click", function () {
        setActiveTab.apply(this, ["raw-view-tab-panel"]);
    }
);
(document.getElementById("uint-view-tab") as HTMLButtonElement).addEventListener(
    "click", function () {
        setActiveTab.apply(this, ["uint-view-tab-panel"]);
    }
);
(document.getElementById("code-gen-view-tab") as HTMLButtonElement).addEventListener(
    "click", function () {
        setActiveTab.apply(this, ["code-gen-view-tab-panel"]);
    }
);

window.onload = () => {
    setGameLanguage.apply(gameLanguageInput);
    setGameVersion.apply(gameVersionInput);
    changeAllBoxNames(boxNames.toStringNames(gameVersion, gameLanguage));
    updateByteView(boxNames.toByteView());
    updateCodeGenView(boxNames.toByteView());
    setActiveTab.apply(
        (document.getElementById("raw-view-tab") as HTMLButtonElement),
        ["raw-view-tab-panel"],
    )
}