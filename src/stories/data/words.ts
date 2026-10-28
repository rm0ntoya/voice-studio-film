import raw from "./words.json";
import anchorsRaw from "./anchors.json";
import { createWords } from "../../data/words";

export const { WORDS, onset, offset, wf, we, display, anchor } = createWords(raw, anchorsRaw);
