import { ArktNode } from "./types";
import { DEFAULT_FILL_COLOR, DEFAULT_STROKE_COLOR } from "@/components/colors/utils";
import { TemplateData } from "@/components/templates/types";
import { DEFAULT_PATH_ID } from "@/components/yjs/constants";
import useUserDataStateSynced from "@/components/yjs/useUserStateSynced";
import { nanoid } from "nanoid";
import { ArktTextNode } from "../text/types";
import { Integration } from "@/components/controls/IntegrationSelector";
import { IntegrationNode } from "../integrations/type";

export const useNewDraftNode = (mobile: boolean = false): {
    getNewDraftArktNode: (templateData?: TemplateData) => ArktNode,
    getNewDraftVirtualNode: (node: ArktNode) => ArktNode,
    getNewDraftTextNode: () => ArktTextNode,
    getNewDraftIntegrationNode: (integration: Integration) => IntegrationNode
} => {
    const { currentUserData } = useUserDataStateSynced()

    const getNewDraftArktNode = (templateData?: TemplateData) => {

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
                rotation: 0,
                strokeWidth: 2,
                fontSize: 12,
                isDraft: mobile? false :true,
                strokeColor: templateData?.strokeColor || DEFAULT_STROKE_COLOR,
            }
        } satisfies ArktNode;
    }

    const getNewDraftVirtualNode = (node: ArktNode) => {
        return {
            ...node,
            id: nanoid(),
            position: { x: -1000, y: -1000 },
            data: {
                ...node.data,
                isDraft: mobile? false :true,
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
            data: {
                pathId: currentUserData?.currentDiagramId || DEFAULT_PATH_ID,
                fillColor: DEFAULT_FILL_COLOR,
                strokeColor: DEFAULT_STROKE_COLOR,
                rotation: 0,
                fontSize: 12,
                label: "New Text",
                isDraft: mobile? false :true,
            },
        } satisfies ArktTextNode;
    }

    const getNewDraftIntegrationNode = (integration: Integration) => {
        return {
            id: nanoid(),
            type: "integration",
            position: { x: -1000, y: -1000 },
            data: {
                pathId: currentUserData?.currentDiagramId || DEFAULT_PATH_ID,
                type: integration,
                url: "",
                description: "",
            }
        } satisfies IntegrationNode;
    }

    return { getNewDraftArktNode: getNewDraftArktNode, getNewDraftVirtualNode, getNewDraftTextNode, getNewDraftIntegrationNode }
}

export const DEFAULT_NODE_WIDTH = 90;
export const DEFAULT_NODE_HEIGHT = 60;

export const NODE_MIN_WIDTH = 20;
export const NODE_MIN_HEIGHT = 20;