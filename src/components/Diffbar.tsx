import { h } from "preact";
import { useState } from "preact/hooks";
import "./Diffbar.css";

//Letter count where diffboxes reach max color
const DIFF_MAX_COLOR = 10;
//Target color codes for min and max values
const DIFF_TARGET_BLANK = [0xd0, 0xd0, 0xd0];
const DIFF_TARGET = [[0xff, 0x00, 0x00], [0x00, 0x51, 0xff]];

const DOWN = "\u25BC";
const UP = "\u25B2";

function Diffbox(props: {char: string, val: number}) {
	const targetEditor = props.val < 0 ? 1 : 0;
	const mult = Math.min(Math.abs(props.val), DIFF_MAX_COLOR) / DIFF_MAX_COLOR;
  let color = [0, 0, 0];
	for(const [i, b] of DIFF_TARGET_BLANK.entries()) {
		const chanRange = DIFF_TARGET[targetEditor][i] - b;
		const chanVal = b + chanRange * mult;
    color[i] = chanVal;
	}
  const style = `background-color: rgb(${color[0]}, ${color[1]}, ${color[2]})`;

  return (
    <span class="db-box" style={style}>
      <span class="db-char">{props.char}</span>
      <span class="db-arrow">{props.val < 0 ? UP : DOWN}</span>
      <span class="db-val">{Math.abs(props.val) + "\u200B"}</span>
    </span>
  );
}

const SORT_FUNCS: ((a: [string, number], b: [string, number]) => number)[] = [
  // default
  (a, b) => 1,
  // frequency
  ([_a, a], [_b, b]) => b - a,
  // alphabetical
  ([a, _a], [b, _b]) => {
    if (a < b) return -1;
    if (a > b) return 1;
    return 0;
  }
];

export default function Diffbar(props: {diff: Map<string, number>}) {
  let [sort, setSort] = useState(0);

  let els: h.JSX.Element[] = [];
  for (const [char, val] of [...props.diff.entries()].sort(SORT_FUNCS[sort])) {
    els.push(<Diffbox char={char} val={val} />);
  }

  if (els.length === 0) {
    return <div class="db-container"></div>
  }

  const sortClass =
    (n: number) => sort === n ? "db-menu-option db-sel" : "db-menu-option";

  return (
    <div class="db-container">
      <span class="db-menu">
        sort...
        <div class="db-menu-content">
          <div class={sortClass(0)} onClick={() => setSort(0)}>default</div>
          <div class={sortClass(1)} onClick={() => setSort(1)}>number</div>
          <div class={sortClass(2)} onClick={() => setSort(2)}>alphabetical</div>
        </div>
      </span>
      {els}
    </div>
  );
}
