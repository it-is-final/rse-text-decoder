import { substituteChar } from './character_maps.js';
import { getCharacterMap } from './character_maps.js';

function addFFPadding(rawBoxNames, targetLength) {
    let output = rawBoxNames;
    if (output.length % targetLength) {
        const emptySlots = targetLength - (output.length % targetLength)
        for (let i = 0; i < emptySlots; i++) {
            output.push(0xFF);
        }
    }
    return output;
}

function gatherBoxNames() {
    let output = []
    const boxNames = document.getElementById("boxNamesInput").getElementsByTagName("input");
    for (const boxName of boxNames) {
        if (boxName.value) {
            output.push(boxName.value);
        }
    }
    return output;
}

function getBoxNamesData() {
    const inputData = gatherBoxNames()
    const lang = document.getElementById('lang').value;
    const [charMap, reverseCharMap] = getCharacterMap(lang)
    let rawBoxNames = []
    for (const rawLine of inputData) {
        addFFPadding(rawBoxNames, 9);
        let line = [...rawLine];
        for (let i = 0; i < line.length; i++) {
            line[i] = substituteChar(line[i], lang);
            if (line[i] in reverseCharMap) {
                rawBoxNames.push(reverseCharMap[line[i]]);
            } else {
                alert("invalid character");
                return null;
            }
        }
    }
    return rawBoxNames;
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

function extractOpcodes(rawBoxNames, opcodeLength) {
    let rawData = [...rawBoxNames];
    addFFPadding(rawData, opcodeLength);
    let opcodes = [];
    for (let i = 0; i < rawData.length; i += opcodeLength) {
        const rawOpcode = rawData.slice(i, i + opcodeLength);
        const opcode = rawOpcode.reduce(
            (partOpcode, byte, index) => partOpcode | byte << (index * 8));
        opcodes.push(opcode >>> 0);
    }
    return opcodes;
}

function main() {
    const rawDataView = document.getElementById('rawDataOutput');
    const thumbView = document.getElementById('thumbOutput');
    const armView = document.getElementById('armOutput');
    const boxNames = getBoxNamesData();
    if (!boxNames) {
        return null;
    }
    const rawData = addFFPadding([...boxNames], 9);
    const thumbData = extractOpcodes(boxNames, 2);
    const armData = extractOpcodes(boxNames, 4);
    rawDataView.value = getRawBoxNamesDisplay(rawData);
    thumbView.value = getOpcodeDisplay(thumbData, 4);
    armView.value = getOpcodeDisplay(armData, 8);
}

document.getElementById("convertButton").addEventListener('click', 
    function() {
        main();
});