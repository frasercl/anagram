import * as HE from "html-entities";

//Letter count where diffboxes reach max color
const DIFF_MAX_COLOR = 10;
const DIFF_TARGET_BLANK = [0xd0, 0xd0, 0xd0];
const DIFF_TARGET = [[0xff, 0x00, 0x00], [0x00, 0x51, 0xff]];

const DOWN = "\u25BC";
const UP = "\u25B2";

const midbar = document.getElementById("midbar");
const dbContainer = document.getElementById("diffbox-container");
const sortOptions = document.getElementsByClassName("db-sort-option");

let selectedSort = "default";
let currentMap = {};

const sorters = {
	"default": function(a, b) {
		return 1;
	},
	"number": function(a, b) {
		return b[1] - a[1];
	},
	"alphabetical": function(a, b) {
		if(a[0] < b[0]) {
			return -1;
		} else if(a[0] > b[0]) {
			return 1;
		} else {
			return 0;
		}
	}
}

function onSortOptionClick(e) {
	e.stopPropagation();
	e.preventDefault();

	if(this.classList.contains("db-sort-selected")) return;
	document.getElementsByClassName("db-sort-selected")[0].classList.remove("db-sort-selected");
	this.classList.add("db-sort-selected");

	selectedSort = this.textContent;

	dbContainer.innerHTML = "";
	updateDiffboxes(currentMap);
}

for(const so of sortOptions) {
	so.addEventListener("click", onSortOptionClick);
}

document.getElementById("diffbox-sort").addEventListener("click", function() {
	if(this.hasAttribute("class")) {
		this.removeAttribute("class");
	} else {
		this.classList.add("holdopen");
	}
});

function getDiffBoxChar(el) {
	return HE.decode(el.children[0].textContent);
}

function getDiffBoxVal(el) {
	const sign = el.children[1].textContent === UP ? -1 : 1
	return parseInt(el.children[2].textContent) * sign;
}

function computeDiffboxColor(val) {
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
	el.style.backgroundColor = computeDiffboxColor(val);
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

//Preserves order of existing boxes
//Assumes boxes are sorted like selected algorithm expects
//TODO: clean up around here, geez! You've made a mess.
export function updateDiffboxes(map) {
	currentMap = map;

	if(midbar.hasAttribute("class")) {
		midbar.removeAttribute("class");
	}

	let elMap = {};
	for(const el of dbContainer.children) {
		elMap[getDiffBoxChar(el)] = getDiffBoxVal(el);
	}
	
	let node = dbContainer.firstElementChild;
	let allMap = Object.entries({...elMap, ...map}).sort(sorters[selectedSort]);
	for(const [c, n] of allMap) {
		if(node) { //In the middle of node list
			if(getDiffBoxChar(node) === c) { //Looking at the right box
				const nodeVal = getDiffBoxVal(node);
				let nextNode = node.nextElementSibling;
				if (nodeVal !== map[c]) {
					if (map[c]) {
						setDiffBoxVal(node, n);
					} else {
						dbContainer.removeChild(node);
					}
				}
				node = nextNode;
			} else { //Create box
				const newNode = createDiffBox(c, n);
				dbContainer.insertBefore(newNode, node);
			}
		} else { //At the end of node list
			const newNode = createDiffBox(c, n);
			dbContainer.appendChild(newNode);
		}
	}
}

export function setMessage(empty) {
	if(empty) {
		midbar.className = "msg msg-empty";
	} else {
		midbar.className = "msg msg-anagram";
	}
}