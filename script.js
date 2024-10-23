import { substituteChar } from './character_maps.js';
import { getCharacterMap } from './character_maps.js';

function getBoxNamesData (rawInputData, lang) {
    const inputData = rawInputData.split('\n')
    const [charMap, reverseCharMap] = getCharacterMap(lang)
    let rawBoxNames = []
    for (const rawLine of inputData) {
        if (rawBoxNames.length % 9) {
            const emptySlots = 9 - (rawBoxNames.length % 9)
            for (let i = 0; i < emptySlots; i++) {
                rawBoxNames.push(0xFF);
            }
        }
        let line = [...rawLine];
        if (line.length > 8) {
            alert("line is too long");
            return null;
        }
        for (let i = 0; i < line.length; i++) {
            line[i] = substituteChar(line[i], lang);
            rawBoxNames.push(reverseCharMap[line[i]]);
        }
    }
    return rawBoxNames;
}

function convertToRaw(rawBoxNames) {
    let rawData = [...rawBoxNames];
    if (rawData.length % 9) {
        const emptySlots = 9 - (rawData.length % 9)
        for (let i = 0; i < emptySlots; i++) {
            rawData.push(0xFF);
        }
    }
    return rawData;
}

function getRawBoxNamesDisplay(rawData) {
    let lines = [];
    let output = [];
    for (let i = 0; i < rawData.length; i += 9) {
        const line = rawData.slice(i, i + 9);
        lines.push(line);
    }
    for (const line of lines) {
        let boxName = [];
        for (const char of line) {
            boxName.push(char.toString(16).padStart(2, '0'));
        }
        output.push(boxName.join(' '));
    }
    return output.join('\n');
}

function getOpcodeDisplay(opcodes, opcodeLength) {
    let output = [];
    for (const opcode of opcodes) {
        output.push(opcode.toString(16).padStart(opcodeLength, '0'));
    }
    return output.join('\n');
}

function getCGDisplay(opcodes) {
    let output = [];
    for (const opcode of opcodes) {
        output.push('0x' + opcode.toString(16).padStart(8, '0'));
    }
    return output.join('\n')
}

function extractOpcodes(rawBoxNames, opcodeLength){
    let opcodes = [];
    for (let i = 0; i < rawBoxNames.length; i += opcodeLength) {
        const rawOpcode = rawBoxNames.slice(i, i + opcodeLength);
        let opcode;
        for (let i = 0; i < rawOpcode.length; i++) {
            opcode = (rawOpcode[i] << (i * 8)) | opcode;
        }
        opcodes.push(opcode >>> 0);
    }
    return opcodes;
}

function main() {
    const rawInputData = document.getElementById('input').value;
    const lang = document.getElementById('lang').value;
    const rawDataView = document.getElementById('output');
    const thumbView = document.getElementById('outputThumb');
    const armView = document.getElementById('outputARM');
    const cgView = document.getElementById('outputCG');
    const boxNames = getBoxNamesData(rawInputData, lang);
    const rawData = convertToRaw(boxNames);
    const thumbData = extractOpcodes(boxNames, 2);
    const armData = extractOpcodes(boxNames, 4);
    rawDataView.value = getRawBoxNamesDisplay(rawData);
    thumbView.value = getOpcodeDisplay(thumbData, 4);
    armView.value = getOpcodeDisplay(armData, 8);
    cgView.value = getCGDisplay(armData);

}

document.getElementById('convertButton').onclick = main;