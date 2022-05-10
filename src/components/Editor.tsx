import { h } from "preact";
import { useState } from "preact/hooks";
import "./Editor.css";

// non-alpha chars that may count as part of a word
const WORD_JOINERS = ["-", "*", "'", "_"];

function isLetter(char: string): boolean {
  return char.toLowerCase() !== char.toUpperCase();
}

function isWordJoiner(char: string): boolean {
  return WORD_JOINERS.indexOf(char) !== -1;
}

type EditableProps = {
  placeholder: string;
  updateContent: (content: string) => void;
}

function Editable(props: EditableProps) {
  const onKeyDown = (e: KeyboardEvent) => {
    // Supress enter
    if (e.key === "Enter") {
      e.preventDefault();
    }
  }

  const onInput = (e: Event) => {
    const el = e.target as Element;
    // Don't allow the browser to add any html!
    if (el.children.length > 0) {
      // Find and save the caret index
      let range = window.getSelection()!.getRangeAt(0);
      let iRange = range.cloneRange();
      iRange.selectNodeContents(el);
      iRange.setEnd(range.endContainer, range.endOffset);
      const pos = iRange.toString().length;

      el.textContent = el.textContent;

      // Restore the caret index
      range.setEnd(el.firstChild!, pos);
      range.collapse();
    }

    props.updateContent(el.textContent || "");
  }

  return (
    <span
      class="ed-editor"
      placeholder={props.placeholder}
      autocorrect="off"
      autocapitalize="off"
      spellcheck={false}
      contentEditable={true}
      onKeyDown={onKeyDown}
      onInput={onInput}
    />
  );
};

type Props = {
  placeholder: string;
  updateMap: (map: Map<string, number>) => void;
  diff: Map<string, number>;
  color: string;
};

export default function Editor(props: Props) {
  let [content, setContent] = useState("");

  const updateContent = (content: string) => {
    setContent(content);

    // Gather letter frequencies in a map and pass it up
    let map = new Map<string, number>();
    content.split("").forEach(char => {
      if (isLetter(char)) {
        const lVal = map.get(char);
        if (typeof lVal === "undefined") {
          map.set(char, 1);
        } else {
          map.set(char, lVal + 1);
        }
      }
    });

    props.updateMap(map);
  }

  let trackingDiff = new Map(props.diff);
  // Create single-char elements to correctly highlight editor contents, while
  // tracking letter diffs
  const makeWordContent = (content: string): h.JSX.Element[] => {
    let result: h.JSX.Element[] = [];
    content.split("").forEach(char => {
      if (isWordJoiner(char)) {
        result.push(<span class="notalpha">{char}</span>);
      } else {
        const freq = trackingDiff.get(char);
        if (freq !== undefined && freq > 0) {
          trackingDiff.set(char, freq - 1);
          result.push(<span class="matched">{char}</span>);
        } else {
          result.push(<span>{char}</span>);
        }
      }
    });
    return result;
  }

  let contentEls: (h.JSX.Element | string)[] = [];
  let whitespace = content.split(/\S+/);
  content.split(/\s+/).forEach(chunk => {
    const wsChunk = whitespace.shift();
    if (typeof wsChunk !== "undefined" && wsChunk.length > 0) {
      contentEls.push(wsChunk);
    }

    let len = chunk.length;
    if (len > 0) {
      let wordHasLetter = isLetter(chunk[0]);
      let lastCharInWord = wordHasLetter || isWordJoiner(chunk[0]);
      let start = 0;
      let wordStart = 0;

      for (let end = 1; end < len; end++) {
        const charIsLetter = isLetter(chunk[end]);
        wordHasLetter = wordHasLetter || charIsLetter;
        const charInWord = charIsLetter || isWordJoiner(chunk[end]);

        if (!lastCharInWord && charInWord) {
          // We've entered a slice that may be a word
          wordStart = end;
        } else if (lastCharInWord && !charInWord && wordHasLetter) {
          // We've ended a slice that is definitely a word.
          // We therefore have also verified the size of the non-word slice
          // before this word, if any.
          if (start !== wordStart) {
            contentEls.push(
              <span class="notword">
                {chunk.slice(start, wordStart)}
              </span>
            );
          }
          contentEls.push(
            <span class="word">
              {makeWordContent(chunk.slice(wordStart, end))}
            </span>
          );

          wordHasLetter = false;
          start = end;
          wordStart = end;
        }

        lastCharInWord = charInWord;
      }

      if (!lastCharInWord || !wordHasLetter) {
        contentEls.push(
          <span class="notword">
            {chunk.slice(start, len)}
          </span>
        );
      } else {
        if (start < wordStart) {
          contentEls.push(
            <span class="notword">
              {chunk.slice(start, wordStart)}
            </span>
          );
        }
        contentEls.push(
          <span class="word">
            {makeWordContent(chunk.slice(wordStart, len))}
          </span>
        );
      }
    }
  });

  return (
    <div class="ed-container">
      <span class="ed-content" style={`color: ${props.color};`}>
        {contentEls}
      </span>
      <Editable placeholder={props.placeholder} updateContent={updateContent} />
    </div>
  );
}
