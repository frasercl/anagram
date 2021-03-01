import * as HE from "html-entities";
import * as util from "./util.js";
import updateDiffBoxes from "./diffboxes.js";

const NBSP = "\u00A0";

const WORD_JOINERS = ["'", "-", "."];

const editors = document.getElementsByClassName("editor");

let editorContents = ["", ""];

let e0Map, e1Map, diffMap;

function countLetters(string) {
	const chars = string.toLowerCase().split("");
	let letters = [];
	for(const c of chars) {
		if(util.isLetter(c)) {
			letters.push(c);
		}
	}

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

function computeDiffMap(m1, m2) {
	const join = {...m1, ...m2};
	const diffMap = {};
	for(const l in join) {
		const c1 = m1[l] || 0;
		const c2 = m2[l] || 0;
		const diff = c1 - c2;
		if(diff) diffMap[l] = diff;
	}
	return diffMap;
}

function editorOnInput() {
	const editorID = parseInt(this.getAttribute("_editor"));
	let content = HE.decode(util.stripHTMLTags(this.innerHTML));
	editorContents[editorID] = content;
	const charArray = content.split("");
	let newHTML = "";
	for (const [i, c] of charArray.entries()) {
		const cLast = charArray[i - 1];
		const cNext = charArray[i + 1];
		const contentEnclosed = !util.isWhitespace(cLast) && !util.isWhitespace(cNext);
		if(util.isLetter(c) || util.isNumber(c)) {
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

	e0Map = countLetters(editorContents[0]);
	e1Map = countLetters(editorContents[1]);

	highlightLetters(document.getElementsByClassName("l0"), e1Map);
	highlightLetters(document.getElementsByClassName("l1"), e0Map);

	updateDiffBoxes(computeDiffMap(e0Map, e1Map));
}

for(const e of editors) {
	e.addEventListener("input", editorOnInput);
}