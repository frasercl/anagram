import { h } from "preact";



type Props = {
  title: string;
  onEdit: (content: string) => void;
  compareMap: Map<string, number>;
};

export default function Editor(props: Props) {
  return (
    <div class="editor"></div>
  )
}
