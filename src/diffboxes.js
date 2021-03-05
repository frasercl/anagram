import * as HE from "html-entities";

//Letter count where diffboxes reach max color
const DIFF_MAX_COLOR = 10;
//Target color codes for min and max values
const DIFF_TARGET_BLANK = [0xd0, 0xd0, 0xd0];
const DIFF_TARGET = [[0xff, 0x00, 0x00], [0x00, 0x51, 0xff]];

const DOWN = "\u25BC";
const UP = "\u25B2";

const midbarEl = document.getElementById("midbar");
const dbContainerEl = document.getElementById("diffbox-container");
const sortOptionEls = document.getElementsByClassName("db-sort-option");

//SORTING FUNCTIONS////////////////////////////////////////

let selectedSort = "default";
let lastMap = {};
let boxElements = {};

const sorters = {
	"default": {
		"func": function(a, b) {
			return 1;
		},
		"unstable": false
	},
	"number": {
		"func": function(a, b) {
			return b[1] - a[1];
		},
		"unstable": true
	},
	"alphabetical": {
		"func": function(a, b) {
			if(a[0] < b[0]) {
				return -1;
			} else if(a[0] > b[0]) {
				return 1;
			} else {
				return 0;
			}
		},
		"unstable": false
	}
}

function sortList(arr) {
	return arr.sort(sorters[selectedSort].func);
}

function sortMap(map) {
	return sortList(Object.entries(map));
}

//SORTING MENU/////////////////////////////////////////////

function onSortOptionClick(e) {
	e.stopPropagation();
	e.preventDefault();

	if(this.classList.contains("db-sort-selected")) return;
	document.getElementsByClassName("db-sort-selected")[0].classList.remove("db-sort-selected");
	this.classList.add("db-sort-selected");

	selectedSort = this.textContent;

	resortBoxes();
}

for(const so of sortOptionEls) {
	so.addEventListener("click", onSortOptionClick);
}

document.getElementById("diffbox-sort").addEventListener("click", function() {
	if(this.hasAttribute("class")) {
		this.removeAttribute("class");
	} else {
		this.classList.add("holdopen");
	}
});

//BOX MANIPULATORS/////////////////////////////////////////

function resortBoxes() {
	const sortedList = sortMap(lastMap);
	let frag = document.createDocumentFragment();
	for(const [char] of sortedList) {
		frag.appendChild(boxElements[char]);
	}
	dbContainerEl.appendChild(frag);
}

function computeDiffBoxColor(val) {
	const targetEditor = val < 0 ? 1 : 0;
	const mult = 1 / DIFF_MAX_COLOR * Math.min(Math.abs(val), DIFF_MAX_COLOR);
	let result = "#";
	for (const [i, b] of DIFF_TARGET_BLANK.entries()) {
		const chanRange = DIFF_TARGET[targetEditor][i] - b;
		const chanVal = b + chanRange * mult;
		result += Math.round(chanVal).toString(16).padStart(2, "0");
	}
	return result;
}

function setDiffBoxVal(el, val) {
	el.children[1].textContent = val < 0 ? UP : DOWN;
	el.children[2].textContent = Math.abs(val);
	el.style.backgroundColor = computeDiffBoxColor(val);
}

function createDiffBox(char, val) {
	const boxEl = document.createElement("span");
	boxEl.className = "db";

	const charEl = document.createElement("span");
	charEl.className = "db-char";
	charEl.textContent = HE.encode(char.toString());
	boxEl.appendChild(charEl);

	const arrowEl = document.createElement("span");
	//Class setting goes here, if ever used
	boxEl.appendChild(arrowEl);

	const valEl = document.createElement("span");
	//Class setting goes here, if ever used
	boxEl.appendChild(valEl);

	setDiffBoxVal(boxEl, val);
	return boxEl;
}

function insertBoxAfterChar(char, el) {
	if (char === null) {
		dbContainerEl.insertAdjacentElement("afterbegin", el);
	} else {
		boxElements[char].insertAdjacentElement("afterend", el);
	}
}

//BIG HONKIN' FANCY UPDATE FUNCTION////////////////////////

export function updateDiffBoxes(diffMap, changeMap) {
	//Remove message from midbar, if there
	if (midbarEl.hasAttribute("class")) {
		midbarEl.removeAttribute("class");
	}

	//First pass: add, remove, update contents where changed
	let statusList = [];
	for(const char in changeMap) {
		if(changeMap[char] === 0) { //Remove an element
			dbContainerEl.removeChild(boxElements[char]);
		} else if(boxElements.hasOwnProperty(char)) { //Update an element
			setDiffBoxVal(boxElements[char], diffMap[char]);
			const notInContainer = boxElements[char].parentNode !== dbContainerEl;
			statusList.push([char, diffMap[char], notInContainer]);
		} else { //Add an element
			boxElements[char] = createDiffBox(char, diffMap[char]);
			statusList.push([char, diffMap[char], true]);
		}
	}

	//Now to sort
	sortList(statusList);
	let sortedCharList = sortMap(diffMap);

	//Second pass: set position of changed els where necessary
	let statusIndex = 0;
	let lastChar = null;
	for(const [c] of sortedCharList) {
		if(statusList[statusIndex] === undefined) break;
		if(statusList[statusIndex][0] === c) { //This is an updated element
			if(statusList[statusIndex][2] || sorters[selectedSort].unstable) {
				//El position needs setting
				insertBoxAfterChar(lastChar, boxElements[c]);
			}
			statusIndex++;
		}
		lastChar = c;
	}

	lastMap = diffMap;
}

export function setMessage(empty) {
	if(empty) {
		midbarEl.className = "msg msg-empty";
	} else {
		midbarEl.className = "msg msg-anagram";
	}
}