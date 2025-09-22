import { ArktNode } from "./types";
import { DEFAULT_FILL_COLOR, DEFAULT_STROKE_COLOR } from "@/components/colors/utils";
import { TemplateData } from "@/components/templates/types";
import { DEFAULT_PATH_ID } from "@/components/yjs/constants";
import useUserDataStateSynced from "@/components/yjs/useUserStateSynced";
import { nanoid } from "nanoid";
import { ArktTextNode } from "../text/types";

export const useNewDraftNode = (): {
    getNewDraftNode: (templateData?: TemplateData) => ArktNode,
    getNewDraftVirtualNode: (node: ArktNode) => ArktNode,
    getNewDraftTextNode: () => ArktTextNode
} => {
    const { currentUserData } = useUserDataStateSynced()

    const getNewDraftNode = (templateData?: TemplateData) => {

        return {
            id: nanoid(),
            type: "arktNode" as const,
            position: { x: -1000, y: -1000 },
            width: DEFAULT_NODE_WIDTH,
            height: DEFAULT_NODE_HEIGHT,
            style: { width: DEFAULT_NODE_WIDTH, height: DEFAULT_NODE_HEIGHT },
            data: {
                label: "New Node",
                pathId: currentUserData?.currentDiagramId || DEFAULT_PATH_ID,
                description: "",
                fillColor: templateData?.fillColor || DEFAULT_FILL_COLOR,
                textColor: DEFAULT_FILL_COLOR,
                iconKey: templateData?.iconKey,
                templateId: templateData?.id,
                githubLink: "",
                rotation: 0,
                strokeWidth: 2,
                fontSize: 12,
                isDraft: true,
                strokeColor: templateData?.strokeColor || DEFAULT_STROKE_COLOR,
                isEphemeralExpansion: false,
                originalId: "",
            },
        }
    }

    const getNewDraftVirtualNode = (node: ArktNode) => {
        return {
            ...node,
            id: nanoid(),
            position: { x: -1000, y: -1000 },
            data: {
                ...node.data,
                pathId: currentUserData?.currentDiagramId || DEFAULT_PATH_ID,
                virtualOf: node.id
            },
        }
    }

    const getNewDraftTextNode = () => {
        return {
            id: nanoid(),
            type: "text" as const,
            position: { x: -1000, y: -1000 },
            width: 110,
            height: 38,
            // style: { width: 106, height: 36 },
            data: {
                pathId: currentUserData?.currentDiagramId || DEFAULT_PATH_ID,
                fillColor: DEFAULT_FILL_COLOR,
                strokeColor: DEFAULT_STROKE_COLOR,
                rotation: 0,
                fontSize: 12,
                label: "New Text",
                isDraft: true,
            },
        } satisfies ArktTextNode;
    }

    return { getNewDraftNode, getNewDraftVirtualNode, getNewDraftTextNode }
}

export const DEFAULT_NODE_WIDTH = 90;
export const DEFAULT_NODE_HEIGHT = 60;

export const NODE_MIN_WIDTH = 20;
export const NODE_MIN_HEIGHT = 20;