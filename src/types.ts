//! SPDX-License-Identifier: MIT
/* 
 * © final 2025.
 * rse-text-decoder is under the MIT License, read the LICENSE file
 * for more information.
 */

'use strict';

export type GameVersion =
    | "RS" // Ruby
    | "FRLG" // FireRed
    | "E" // Emerald

export type GameLanguage = 
    | "JPN" 
    | "ENG" 
    | "FRA" 
    | "ITA" 
    | "GER" 
    | "SPA"

export function isGameVersion(
    version: GameVersion | string,
): version is GameVersion {
    return (
        version === "RS"
        || version === "FRLG"
        || version === "E"
    );
}

export function isGameLanguage(
    language: GameLanguage | string,
): language is GameLanguage {
    return (
        language === "JPN"
        || language === "ENG"
        || language === "FRA"
        || language === "ITA"
        || language === "GER"
        || language === "SPA"
    );
}
