import { substituteChar } from './character_maps.js';
import { getCharacterMap } from './character_maps.js';

function addFFPadding(data, targetLength) {
    let output = [];
    const remainder = data.length % targetLength;
    const neededPadding = (targetLength - remainder) % targetLength;
    for (let i = 0; i < neededPadding; i++) {
        output.push(0xFF);
    }
    return output;
}

function getBoxNamesData() {
    const inputData = (function() {
        let output = []
        const boxNames = document.getElementById("boxNamesInput").querySelectorAll("input");
        for (const boxName of boxNames) {
            output.push(boxName.value);
        }
        return output;
    })();
    const lang = document.getElementById('lang').value;
    const [charMap, reverseCharMap] = getCharacterMap(lang)
    let rawBoxNames = []
    for (const rawLine of inputData) {
        rawBoxNames.push(...addFFPadding(rawBoxNames, 9));
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
        if (rawLine.length === 0) {
            rawBoxNames.push(...[0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF])
        }
    }
    return rawBoxNames;
}

function getOpcodeDisplay(opcodes, opcodeLength) {
    let output = [];
    for (const opcode of opcodes) {
        output.push(opcode.toString(16).padStart(opcodeLength, '0'));
    }
    return output.join('\n');
}

function extractOpcodes(rawBoxNames, opcodeLength) {
    let rawData = rawBoxNames.concat(addFFPadding(rawBoxNames, opcodeLength));
    let opcodes = [];
    for (let i = 0; i < rawData.length; i += opcodeLength) {
        const rawOpcode = rawData.slice(i, i + opcodeLength);
        const opcode = rawOpcode.reduce(
            (partOpcode, byte, index) => partOpcode | byte << (index * 8));
        opcodes.push(opcode >>> 0);
    }
    return opcodes;
}

const boxNamesEntry = document.getElementById("boxNamesInput");
function addBox () {
    const boxCount = boxNamesEntry.querySelectorAll("input").length;
    if (boxCount >= 14) {
        alert("Illegal operation");
        return;
    }
    const frag = new DocumentFragment;
    const boxLabel = document.createElement("label");
    const boxEntry = document.createElement("input");
    const boxID = `box${boxCount + 1}Entry`
    boxLabel.htmlFor = boxID;
    boxLabel.innerText = `Box ${boxCount + 1}:`
    frag.appendChild(boxLabel);
    boxEntry.id = boxID;
    boxEntry.type = "text";
    boxEntry.maxLength = 9;
    boxEntry.spellcheck = false;
    boxEntry.autocomplete = false;
    frag.appendChild(boxEntry);
    boxNamesEntry.appendChild(frag);
};

addBox();

document.getElementById("addBoxButton").addEventListener('click', addBox);
document.getElementById("removeBoxButton").addEventListener('click', function () {
    const boxCount = boxNamesEntry.querySelectorAll("input").length;
    if (boxCount <= 1) {
        alert("Illegal operation");
        return;
    }
    const allBoxes = boxNamesEntry.querySelectorAll("input")
    const lastBoxID = allBoxes[boxCount - 1].id;
    boxNamesEntry.removeChild(allBoxes[boxCount - 1]);
    for (const label of boxNamesEntry.querySelectorAll("label")) {
        if (label.htmlFor === lastBoxID) {
            boxNamesEntry.removeChild(label);
        }
    }
})

document.getElementById("convertButton").addEventListener('click', 
    function() {
        const rawDataView = document.getElementById('rawDataOutput');
        const thumbView = document.getElementById('thumbOutput');
        const armView = document.getElementById('armOutput');
        const boxNames = getBoxNamesData();
        if (!boxNames) {
            return null;
        }
        const rawData = boxNames.concat(addFFPadding(boxNames, 9))
        const thumbData = extractOpcodes(boxNames, 2);
        const armData = extractOpcodes(boxNames, 4);
        rawDataView.value = (function (rawData) {
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
        })(rawData);
        thumbView.value = getOpcodeDisplay(thumbData, 4);
        armView.value = getOpcodeDisplay(armData, 8);
});
