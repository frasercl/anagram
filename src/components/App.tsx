import { h, Fragment } from "preact";
import { useState } from "preact/hooks";
import Editor from "./Editor";
import Diffbar from "./Diffbar";

export default function App() {
  let [map0, setMap0] = useState(new Map<string, number>());
  let [map1, setMap1] = useState(new Map<string, number>());
  
  let diff = new Map(map0);
  for (const [char, val1] of map1) {
    const val0 = diff.get(char);

    if (typeof val0 !== "undefined") {

      const newVal = val0 - val1;
      if (newVal === 0) {
        diff.delete(char);
      } else {
        diff.set(char, newVal);
      }

    } else {
      diff.set(char, -val1);
    }
  }

  return (
    <>
      <h2 style="margin-left: 20px;">Anagram Writer</h2>
      <Editor
        placeholder="Type some stuff here!"
        color="#ff0000"
        updateMap={setMap0}
        diff={map1}
      />
      <Diffbar diff={diff} hasContent={map0.size > 0}/>
      <Editor
        placeholder="Or you can type stuff here!"
        color="#0051ff"
        updateMap={setMap1}
        diff={map0}
      />
    </>
  );
}
