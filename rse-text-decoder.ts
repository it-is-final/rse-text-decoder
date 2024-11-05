import { substituteChar } from './character_maps.ts';
import { getReverseCharacterMap } from './character_maps.ts';

type InputPair = [HTMLLabelElement, HTMLInputElement]

const boxNamesEntry = document.getElementById("boxNamesInput") as HTMLFieldSetElement;
const rawDataView = document.getElementById('rawDataOutput') as HTMLTextAreaElement;
const thumbView = document.getElementById('thumbOutput') as HTMLTextAreaElement;
const armView = document.getElementById('armOutput') as HTMLTextAreaElement;
const readLang = () => {
    const langSelect = document.getElementById('lang');
    if (langSelect) return (langSelect as HTMLSelectElement).value;
    else throw new Error("Unset language");
}
const boxInputs: InputPair[] = [];

const addFFPadding = (data: Array<number>, targetLength: number) => {
    const remainder = data.length % targetLength;
    const neededPadding = (targetLength - remainder) % targetLength;
    return Array(neededPadding).fill(0xFF) as number[];
}

const writeOpcodeDisplay = (opcodes: number[], opcodeLength: number) => {
    const output = opcodes.map(opcode => opcode.toString(16).padStart(opcodeLength));
    return output.join('\n');
}

const readOpcodes = (rawData: number[], opcodeLength: number) => {
    const opcodes: number[] = [];
    for (let i = 0;
        i < rawData.concat(addFFPadding(rawData, opcodeLength)).length;
        i += opcodeLength) {
        const rawOpcode = rawData.slice(i, i + opcodeLength);
        const opcode = rawOpcode.reduce((partialOpcode, byte, i) => partialOpcode | byte << (8 * i))
        opcodes.push(opcode >>> 0);
    }
    return opcodes;
}

function addBox() {
    const frag = new DocumentFragment;
    const boxLabel = document.createElement("label");
    const boxEntry = document.createElement("input");
    const boxID = `box${boxInputs.length + 1}Entry`
    boxLabel.htmlFor = boxID;
    boxLabel.innerText = `Box ${boxInputs.length + 1}:`
    frag.appendChild(boxLabel);
    boxEntry.id = boxID;
    boxEntry.type = "text";
    boxEntry.maxLength = 9;
    boxEntry.spellcheck = false;
    frag.appendChild(boxEntry);
    boxInputs.push([boxLabel, boxEntry]);
    boxNamesEntry.appendChild(frag);
};

addBox();

(document.getElementById("addBoxButton") as HTMLButtonElement).addEventListener('click', function() {
    addBox();
    if (boxInputs.length >= 14) this.disabled = true;
    if (boxInputs.length > 1) (document.getElementById("removeBoxButton") as HTMLButtonElement).disabled = false;
});
(document.getElementById("removeBoxButton") as HTMLButtonElement).addEventListener('click', function () {
    const removedInput = boxInputs.pop()
    if (!removedInput) return;
    for (const element of removedInput) boxNamesEntry.removeChild(element);
    if (boxInputs.length <= 1) this.disabled = true;
    if (boxInputs.length < 14) (document.getElementById("addBoxButton") as HTMLButtonElement).disabled = false;
});

(document.getElementById("convertButton") as HTMLButtonElement).addEventListener('click', 
    _ => {
        const readInput = () => {
            const inputData = boxInputs.map((inputPair) => inputPair[1]).map((input) => input.value)
            const charMap = getReverseCharacterMap(readLang())
            const outputData: number[] = [];
            for (const line of inputData) {
                outputData.push(...addFFPadding(outputData, 9));
                outputData.push(...[...line].map(char => substituteChar(char, readLang())).map(char => {
                    const mapping = charMap.get(char);
                    if (mapping) return mapping
                    else throw new Error("Invalid characters in input")
                }))
                if (line.length === 0) outputData.push(...(new Uint8Array(9).fill(0xFF)))
            }
            return outputData;
        }
        let boxNames: number[];
        try {
            boxNames = readInput();
        } catch(e) {
            alert("Invalid characters was entered");
            return;
        }
        const writeRawDataDisplay = (data: number[]) => {
            const lines: number[][] = [];
            for (let i = 0; i < data.length; i += 9) lines.push(data.slice(i, i + 9));
            return lines.map(line => line.map(char => char.toString(16).padStart(2, '0')).join(' ')).join('\n')
        }
        const rawData = boxNames.concat(addFFPadding(boxNames, 9))
        const thumbData = readOpcodes(boxNames, 2);
        const armData = readOpcodes(boxNames, 4);
        rawDataView.value = writeRawDataDisplay(rawData);
        thumbView.value = writeOpcodeDisplay(thumbData, 4);
        armView.value = writeOpcodeDisplay(armData, 8);
});
