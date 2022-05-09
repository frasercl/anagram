import { h, Fragment } from "preact";
import { useState } from "preact/hooks";
import Editor from "./Editor";

export default function App() {
  let [map0, setMap0] = useState(new Map<string, number>());
  let [map1, setMap1] = useState(new Map<string, number>());

  return (
    <>
      <h2 style="margin-left: 20px;">Anagram Writer</h2>
      <Editor
        placeholder="Type some stuff here!"
        color="#ff0000"
        updateMap={setMap0}
        diff={map1}
      />
      <Editor
        placeholder="Or you can type stuff here!"
        color="#0051ff"
        updateMap={setMap1}
        diff={map0}
      />
    </>
  )
}
