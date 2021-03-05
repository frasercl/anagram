import * as HE from "html-entities";
import * as util from "./util.js";
import {updateDiffBoxes, setMessage} from "./diffboxes.js";

const NBSP = "\u00A0";
const WORD_JOINERS = ["'", "-", "."];

const editors = document.getElementsByClassName("editor");

let editorContents = ["", ""];

//Many things want this map, so it gets an export
//WARNING: this is a bit of cyclic import! I'm doing it HERE ONLY.
//TODO: take care of this
export let g_currentDiffMap = {};

//pre-condition: string contains only countable characters
function countLetters(string) {
	const letters = string.toLowerCase().split("");

	let letterMap = {};
	for(const l of letters) {
		if(letterMap.hasOwnProperty(l)) {
			letterMap[l]++;
		} else {
			letterMap[l] = 1;
		}
	}

	return letterMap;
}

function highlightLetters(nodes, letters) {
	for(const n of nodes) {
		let c = n.textContent.toLowerCase();
		if(letters[c]) {
			letters[c] -= 1;
			n.classList.remove("lu");
		} else {
			n.classList.add("lu");
		}
	}
}

function computeDiffMap(m1, m2, keepValue = false) {
	const join = {...m1, ...m2};
	let diffMap = {};
	for(const l in join) {
		const c1 = m1[l] || 0;
		const c2 = m2[l] || 0;
		const diff = c1 - c2;
		if(diff) diffMap[l] = keepValue ? c1 : diff;
	}
	return diffMap;
}

//TODO: boy, this whole place really has got to be looked at.
function editorOnInput() {
	const editorID = parseInt(this.getAttribute("_editor"));
	let content = HE.decode(this.textContent);
	editorContents[editorID] = "";
	const charArray = content.split("");
	//TODO: the following is terrible and must be replaced.
	let newHTML = "";
	for (const [i, c] of charArray.entries()) {
		const cLast = charArray[i - 1];
		const cNext = charArray[i + 1];
		const contentEnclosed = !util.isWhitespace(cLast) && !util.isWhitespace(cNext);
		if(util.isLetter(c) || util.isNumber(c)) {
			editorContents[editorID] += c;
			newHTML += `<span class="l${editorID}">${HE.encode(c)}</span>`;
		} else if(c === NBSP && cNext !== undefined && (cLast === NBSP || contentEnclosed)) {
			//This ludicrous boolean expression attempts to deal with the arcane behavior of &nbsp;
			newHTML += " ";
		} else {
			newHTML += HE.encode(c);
		}
	}

	const caretIndex = util.getCaretIndex(this);
	this.innerHTML = newHTML;
	util.setCaretIndex(this, caretIndex);

	const e0Map = countLetters(editorContents[0]);
	const e1Map = countLetters(editorContents[1]);
	//A: do above need to be globals?
	//B: do the below pass by reference and do weird stuff to data?
	highlightLetters(document.getElementsByClassName("l0"), e1Map);
	highlightLetters(document.getElementsByClassName("l1"), e0Map);

	const newDiffMap = computeDiffMap(e0Map, e1Map);
	let changeMap = computeDiffMap(newDiffMap, g_currentDiffMap, true);
	g_currentDiffMap = newDiffMap;
	
	if(Object.keys(changeMap).length > 0) {
		updateDiffBoxes(g_currentDiffMap, changeMap);
	}

	if (Object.keys(newDiffMap).length === 0) {
		setMessage(editorContents[0].length === 0);
	}
}

for(const e of editors) {
	e.addEventListener("input", editorOnInput);
}