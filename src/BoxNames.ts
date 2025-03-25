import { GameVersion, GameLanguage } from "./types";
import { 
    rubyCharacterMaps,
    fireredCharacterMaps,
    emeraldCharacterMaps,
    rubyCharacterMapsR,
    fireredCharacterMapsR,
    emeraldCharacterMapsR,
} from "./character-maps";

export class BoxNames {
    data = Object.seal([
        new Uint8Array(9).fill(0xFF),
        new Uint8Array(9).fill(0xFF),
        new Uint8Array(9).fill(0xFF),
        new Uint8Array(9).fill(0xFF),
        new Uint8Array(9).fill(0xFF),
        new Uint8Array(9).fill(0xFF),
        new Uint8Array(9).fill(0xFF),
        new Uint8Array(9).fill(0xFF),
        new Uint8Array(9).fill(0xFF),
        new Uint8Array(9).fill(0xFF),
        new Uint8Array(9).fill(0xFF),
        new Uint8Array(9).fill(0xFF),
        new Uint8Array(9).fill(0xFF),
        new Uint8Array(9).fill(0xFF),
    ]);

    getDataAsStream() {
        const out = new Uint8Array(9 * 14);
        for (const [i, j] of this.data.entries()) {
            out.set(j, i * j.length);
        }
        return out;
    }

    getStringNames(version: GameVersion, language: GameLanguage) {
        const characterMap = ((version, language) => {
            switch (version) {
                case "RS":
                    return rubyCharacterMaps[language];
                case "FRLG":
                    return fireredCharacterMaps[language];
                case "E":
                    return emeraldCharacterMaps[language];
            }
        })(version, language);
        return this.data.map(
            (x) => Array.from(x)
                            .map(b => characterMap.get(b) ?? " ")
                            .join("")
                            .split("\0")[0]
        );
    }

    setNameFromString(
        boxIndex: number,
        sName: string,
        version: GameVersion,
        language: GameLanguage
    ) {
        const reverseCharMap = ((version, language) => {
            switch (version) {
                case "RS":
                    return rubyCharacterMapsR[language];
                case "FRLG":
                    return fireredCharacterMapsR[language];
                case "E":
                    return emeraldCharacterMapsR[language];
            }
        })(version, language);
        for (const i of this.data[boxIndex].keys()) {
            const c = sName.charAt(i);
            if (c === "") {
                this.data[boxIndex][i] = 0xFF;
            } else if (reverseCharMap.has(c)) {
                this.data[boxIndex][i] = reverseCharMap.get(c);
            } else {
                throw new Error("Invalid character");
            }
        }
    }

    setNamesFromBytes(bytes: Uint8Array<ArrayBuffer>) {
        if (bytes.length !== (14 * 9)) {
            throw new Error("Malformed bytearray");
        }
        for (const [i, boxName] of this.data.entries()) {
            for (const c of boxName.keys()) {
                boxName[c] = bytes[(boxName.length * i) + c];
            }
        }
    }
}
