import { ArktNode } from "./arkt/types";
import { FreehandNodeType } from "./freehand/types";
import { ArktTextNode } from "./text/types";

export type NodeUnion = ArktNode | FreehandNodeType | ArktTextNode

