//! SPDX-License-Identifier: MIT
/* 
 * © it-is-final 2025.
 * rse-text-decoder is under the MIT License, read the LICENSE file
 * for more information.
 */

import { characterMaps, reverseCharacterMaps } from "./character-maps";

type Language = 
    | "JAP" 
    | "ENG" 
    | "FRA" 
    | "ITA" 
    | "GER" 
    | "SPA"

class BoxNames {
    boxNames = (() => {
        const _boxNames = [
            [0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0],
        ]
        Object.seal(_boxNames);
        for (const boxName of _boxNames) {
            Object.seal(boxName);
        }
        return _boxNames;
    })();
    
    constructor() {
    }

    toStringNames(language: Language) {
        return this.boxNames.map(
            (boxName) => boxName.map(
                        bNameChrIdx => 
                            (
                                characterMaps[language] as
                                ReadonlyMap<number, string>
                            ).get(bNameChrIdx) ?? " "
                        )
                        .join("")
                        .split("\0")[0]
        );
    }

    toByteArray() {
        return this.boxNames.flat();
    }

    editBoxNameFromString(
        boxNNumber: number,
        sBoxName: string,
        language: Language
    ) {
        // Length of the box name is always 9
        for (let i = 0; i < 9; i++) {
            const c = sBoxName.charAt(i);
            if (c === undefined) {
                this.boxNames[boxNNumber][i] = 0xFF;
            } else {
                this.boxNames[boxNNumber][i] =
                (
                    reverseCharacterMaps[language] as
                    ReadonlyMap<string, number>
                ).get(c) ?? 0;
            }
        }
    }

    fromByteArray(byteArray: number[]) {
        if (byteArray.length !== (14 * 9)) {
            throw new Error("Malformed bytearray");
        }
        let bArrIdx = 0;
        for (let bNNum = 0; bNNum < 14; bNNum++) {
            for (let chrIdx = 0; chrIdx < 9; chrIdx++) {
                this.boxNames[bNNum][chrIdx] = byteArray[bArrIdx++];
            }
        }
    }
}

const boxNames = new BoxNames();

window.onload = () => {
    
}