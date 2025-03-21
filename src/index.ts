//! SPDX-License-Identifier: MIT
/* 
 * © it-is-final 2025.
 * rse-text-decoder is under the MIT License, read the LICENSE file
 * for more information.
 */

import { characterMaps, convertJpnToStandard, convertToFrlgeElipsis, convertToJPNFullWidth, convertToRsElipsis, reverseCharacterMaps } from "./character-maps";

type GameVersion =
    | "RS" // Ruby
    | "FRLG" // FireRed
    | "E" // Emerald

type Language = 
    | "JPN" 
    | "ENG" 
    | "FRA" 
    | "ITA" 
    | "GER" 
    | "SPA"

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
        let sBoxNames = this.#boxNames.map(
            boxName => [...boxName].map(
                bNameChrIdx => characterMaps[language].get(bNameChrIdx) ?? " "
            ).join("").split("\0")[0]
        );
        switch (language) {
            case "JPN":
                sBoxNames = sBoxNames.map(convertToJPNFullWidth);
                if (
                    gameVersion === "RS"
                    || gameVersion === "E"
                ) {
                    sBoxNames = sBoxNames.map(convertToRsElipsis);
                }
                break;
            case "ENG":
            case "FRA":
            case "ITA":
            case "GER":
            case "SPA":
                if (gameVersion === "RS") {
                    sBoxNames = sBoxNames.map(convertToRsElipsis);
                }
                break;
        }
        return sBoxNames;
    }

    toByteView() {
        return this.#boxNames;
    }

    editBoxNameFromString(
        boxNNumber: number,
        sBoxName: string,
        language: Language
    ) {
        let _sBoxName: string;
        // Normalise inputs, makes processing easier
        if (language === "JPN") {
            _sBoxName = convertJpnToStandard(sBoxName);
        } else {
            _sBoxName = convertToFrlgeElipsis(sBoxName);
        }
        
        // Length of the box name is always 9
        for (let i = 0; i < 9; i++) {
            const c = _sBoxName.charAt(i);
            if (c === undefined || c === "") {
                this.#boxNames[boxNNumber][i] = 0xFF;
            } else if (reverseCharacterMaps[language].has(c)) {
                this.#boxNames[boxNNumber][i] = reverseCharacterMaps[language].get(c);
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

function updateByteView(newByteView: Uint8Array<ArrayBuffer>[]) {
    boxNamesByteView.value = newByteView.map(
        row => (
            [...row].map(
                chr => chr.toString(16).toUpperCase().padStart(2, "0")
            ).join(" ")
        )
    ).join("\n");
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

gameLanguageInput.addEventListener("input", setGameLanguage);
gameVersionInput.addEventListener("input", setGameVersion);

for (const [i, boxNameInput] of boxNameInputs.entries()) {
    boxNameInput.addEventListener("input", function () {
        try {
            boxNames.editBoxNameFromString(i, this.value, gameLanguage);
            this.setCustomValidity(""); // Blank error message marks field as valid
            updateByteView(boxNames.toByteView());
        } catch (e) {
            this.setCustomValidity(e);
        }
    });
}

boxNamesByteView.addEventListener("input", function () {
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
})

window.onload = () => {
    setGameLanguage.apply(gameLanguageInput);
    setGameVersion.apply(gameVersionInput);
    changeAllBoxNames(boxNames.toStringNames(gameVersion, gameLanguage));
    updateByteView(boxNames.toByteView());
}