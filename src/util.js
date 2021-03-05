//from https://javascript.plainenglish.io/how-to-find-the-caret-inside-a-contenteditable-element-955a5ad9bf81
export function getCaretIndex(element) {
	let position = 0;
	const isSupported = typeof window.getSelection !== "undefined";
	if (isSupported) {
		const selection = window.getSelection();
		if (selection.rangeCount !== 0) {
			const range = window.getSelection().getRangeAt(0);
			const preCaretRange = range.cloneRange();
			preCaretRange.selectNodeContents(element);
			preCaretRange.setEnd(range.endContainer, range.endOffset);
			position = preCaretRange.toString().length;
		}
	}
	return position;
}

//Recursion? In MY textbox? It's more likely than you think
//adapted from https://stackoverflow.com/questions/6249095/how-to-set-caretcursor-position-in-contenteditable-element-div
//	and https://www.javascriptcookbook.com/article/traversing-dom-subtrees-with-a-recursive-walk-the-dom-function/
function moveRangeToIndex(node, index, range) {
	if (node.nodeType === Node.TEXT_NODE) {
		const rangeEnd = Math.min(node.length, index.val);
		range.setEnd(node, rangeEnd);
		index.val -= rangeEnd;
	} else {
		node = node.firstChild;
		while(node && index.val > 0) {
			range = moveRangeToIndex(node, index, range);
			node = node.nextSibling;
		}
	}
	return range;
}

export function setCaretIndex(node, index) {
	let range = document.createRange();
	range.selectNode(node);
	range.setStart(node, 0);

	range = moveRangeToIndex(node, {val: index}, range);

	range.collapse(false);
	let sel = window.getSelection();
	sel.removeAllRanges();
	sel.addRange(range);
}

//from https://css-tricks.com/snippets/javascript/strip-html-tags-in-javascript/
//TODO: get to know this regex better
//TODO also: do we need this? Or is it better to stick to textContent?
export function stripHTMLTags(str) {
	return str.replace(/(<([^>]+)>)/gi, "");
}

export function isWhitespace(char) {
	return /\s/.test(char);
}

//from https://coderrocketfuel.com/article/how-to-check-if-a-character-is-a-letter-using-javascript
export function isLetter(char) {
	return char.toLowerCase() != char.toUpperCase();
}

export function isNumber(char) {
	return !isNaN(parseInt(char, 10));
}