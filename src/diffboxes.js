import * as HE from "html-entities";

//Letter count where diffboxes reach max color
const DIFF_MAX_COLOR = 10;
const DIFF_TARGET_BLANK = [0xd0, 0xd0, 0xd0];
const DIFF_TARGET = [[0xff, 0x00, 0x00], [0x00, 0x51, 0xff]];

const DOWN = "\u25BC";
const UP = "\u25B2";

const midbar = document.getElementById("midbar");

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
	charEl.textContent = char.toString();
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
export default function updateDiffboxes(map) {
	let elMap = {};
	for(const el of midbar.children) {
		elMap[getDiffBoxChar(el)] = getDiffBoxVal(el);
	}
	
	let node = midbar.firstElementChild;
	//TODO: consider sortable/sorted array
	for(const c in {...elMap, ...map}) {
		if(node) { //In the middle of node list
			if(getDiffBoxChar(node) === c) { //Looking at the right box
				const nodeVal = getDiffBoxVal(node);
				let nextNode = node.nextElementSibling;
				if (nodeVal !== map[c]) {
					if (map[c]) {
						setDiffBoxVal(node, map[c]);
					} else {
						midbar.removeChild(node);
					}
				}
				node = nextNode;
			} else { //Create box
				const newNode = createDiffBox(c, map[c]);
				midbar.insertBefore(newNode, node);
			}
		} else { //At the end of node list
			const newNode = createDiffBox(c, map[c]);
			midbar.appendChild(newNode);
		}
	}
}