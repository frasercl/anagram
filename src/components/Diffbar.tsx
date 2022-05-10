import { h } from "preact";
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

export default function Diffbar(props: {diff: Map<string, number>}) {
  let els: h.JSX.Element[] = [];
  for (const [char, val] of props.diff) {
    els.push(<Diffbox char={char} val={val} />);
  }

  return <div class="db-container">{els}</div>;
}
