import { substituteChar } from './character_maps.js';
import { getCharacterMap } from './character_maps.js';

const boxNamesEntry = document.getElementById("boxNamesInput");
const rawDataView = document.getElementById('rawDataOutput');
const thumbView = document.getElementById('thumbOutput');
const armView = document.getElementById('armOutput');
const lang = _ => document.getElementById('lang').value;
const addBoxButton = document.getElementById("addBoxButton");
const removeBoxButton = document.getElementById("removeBoxButton");
const boxCount = _ => boxNamesEntry.querySelectorAll("input").length;
addBox();

function addFFPadding(data, targetLength) {
    const remainder = data.length % targetLength;
    const neededPadding = (targetLength - remainder) % targetLength;
    return Array(neededPadding).fill(0xFF);
}

function extractOpcodes(rawBoxNames, opcodeLength) {
    const rawData = rawBoxNames.concat(addFFPadding(rawBoxNames, opcodeLength));
    let opcodes = [];
    for (let i = 0; i < rawData.length; i += opcodeLength) {
        const rawOpcode = rawData.slice(i, i + opcodeLength);
        const opcode = rawOpcode.reduce((partOpcode, byte, index) => partOpcode | byte << (index * 8));
        opcodes.push(opcode >>> 0);
    }
    return opcodes;
}

function addBox() {
    const frag = new DocumentFragment;
    const boxLabel = document.createElement("label");
    const boxEntry = document.createElement("input");
    const boxID = `box${boxCount() + 1}Entry`
    boxLabel.htmlFor = boxID;
    boxLabel.innerText = `Box ${boxCount() + 1}:`
    frag.appendChild(boxLabel);
    boxEntry.id = boxID;
    boxEntry.type = "text";
    boxEntry.maxLength = 9;
    boxEntry.spellcheck = false;
    boxEntry.autocomplete = false;
    frag.appendChild(boxEntry);
    boxNamesEntry.appendChild(frag);
};

addBoxButton.addEventListener('click', function() {
    addBox();
    if (boxCount() >= 14)
        this.disabled = true;
    if (boxCount() > 1)
        removeBoxButton.disabled = false;
});

removeBoxButton.addEventListener('click', function() {
    const allBoxInputs = boxNamesEntry.querySelectorAll("input");
    const allBoxLabels = boxNamesEntry.querySelectorAll("label");
    const lastBox = allBoxInputs[boxCount() - 1];
    boxNamesEntry.removeChild([...allBoxLabels].filter((label) => label.htmlFor === lastBox.id)[0]);
    boxNamesEntry.removeChild(lastBox);
    if (boxCount() <= 1)
        this.disabled = true;
    if (boxCount() < 14)
        addBoxButton.disabled = false;
})

document.getElementById("convertButton").addEventListener('click', 
    () => {
        const getBoxNames = function readBoxNames() {
            const input = document.getElementById("boxNamesInput").querySelectorAll("input");
            const readInput = () => [...input].map((line) => line.value);
            const inputData = readInput();
            const [charMap, reverseCharMap] = getCharacterMap(lang())
            let data = [];
            for (const line of inputData) {
                data.push(...addFFPadding(data, 9));
                const nameString = [...line].map((char) => substituteChar(char, lang()));
                if (!(nameString.filter((char) => !(char in reverseCharMap)).length === 0))
                    throw new Error("Invalid character");
                data.push(...nameString.map((char) => reverseCharMap[char]));
                if (nameString.length === 0)
                    data.push(Array(9).fill(0xFF));
            }
            return data;
        }
        const formatRawData = (rawData) => {
            let lines = [];
            for (let i = 0; i < rawData.length; i += 9)
                lines.push(rawData.slice(i, i + 9));
            const output = lines.map((line) => line.map((char) => char.toString(16).padStart(2, '0')).join(' '));
            return output.join('\n');
        }
        const writeDisplayOpcodes = (opcodes, opcodeLength) => opcodes.map((opcode) => opcode.toString(16).padStart(opcodeLength, '0')).join('\n');
        let rawData;
        try {
            rawData = getBoxNames();    
        } catch(e) {
            alert("Invalid characters were found");
            console.log(e);
            return;
        }
        const thumbData = extractOpcodes(rawData, 2);
        const armData = extractOpcodes(rawData, 4);
        rawDataView.value = formatRawData(rawData.concat(addFFPadding(rawData, 9)));
        thumbView.value = writeDisplayOpcodes(thumbData, 4);
        armView.value = writeDisplayOpcodes(armData, 8);
});
