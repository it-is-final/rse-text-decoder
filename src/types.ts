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

export type Language = 
    | "JPN" 
    | "ENG" 
    | "FRA" 
    | "ITA" 
    | "GER" 
    | "SPA"

export interface languageToCharMapMap {
    JPN: ReadonlyMap<number, string>,
    ENG: ReadonlyMap<number, string>,
    FRA: ReadonlyMap<number, string>,
    ITA: ReadonlyMap<number, string>,
    GER: ReadonlyMap<number, string>,
    SPA: ReadonlyMap<number, string>,
}

export interface reverseToCharMapMap {
    JPN: ReadonlyMap<string, number>,
    ENG: ReadonlyMap<string, number>,
    FRA: ReadonlyMap<string, number>,
    ITA: ReadonlyMap<string, number>,
    GER: ReadonlyMap<string, number>,
    SPA: ReadonlyMap<string, number>,
}
