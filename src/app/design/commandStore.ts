import { create } from 'zustand';
import { type XYPosition } from '@xyflow/react';
import { ArktNode } from '@/components/nodes/arkt/types';
import { ArktTextNode } from '@/components/nodes/text/types';
import { Integration } from '@/components/controls/IntegrationSelector';
import { IntegrationNode } from '@/components/nodes/arkt/integrations/type';

// Define specific data types for each command
type OpenCreateTemplateData = {
  templateId?: string;
};

type Command<T = unknown> = {
  status: "pending" | "inactive";
  data?: T;
};

type AddNodeData = {
  nodes: (ArktNode | ArktTextNode | IntegrationNode)[];
};

type IntegrationDialogData = {
  type: Integration;
  url: string;
};

export type CommandTypes = 
"open-templates-manager" |
 "open-create-template" |
 "freehand-mode" |
 "add-node" |
 "dragging-node" |
 "open-add-virtual-dialog" |
 "open-integration-dialog" |
 "open-add-integration-dialog" |
 "open-export-dialog" |
 "open-import-dialog";

// Create a mapped type for better type safety
type CommandMap = {
  "open-templates-manager": Command;
  "open-create-template": Command<OpenCreateTemplateData>;
  "freehand-mode": Command;
  "add-node": Command<AddNodeData>;
  "dragging-node": Command;
  "open-add-virtual-dialog": Command;
  "open-integration-dialog": Command<IntegrationDialogData>;
  "open-add-integration-dialog": Command;
  "open-export-dialog": Command;
  "open-import-dialog": Command;
};

interface AppState {
  connectionLinePath: XYPosition[];
  setConnectionLinePath: (connectionLinePath: XYPosition[]) => void;
  latestCommand: CommandTypes | null;
  commandMap: CommandMap;
  activateCommand: <K extends CommandTypes>(command: K, data?: CommandMap[K]['data']) => void;
  removeCommand: (command: CommandTypes) => void;
}

export const useCommandStore = create<AppState>((set) => ({
  connectionLinePath: [],
  setConnectionLinePath: (connectionLinePath) => set({ connectionLinePath }),
  latestCommand: null,
  commandMap: {
    "open-templates-manager": { status: "inactive" },
    "open-create-template": { status: "inactive" },
    "freehand-mode": { status: "inactive" },
    "add-node": { status: "inactive" },
    "dragging-node": { status: "inactive" },
    "open-add-virtual-dialog": { status: "inactive" },
    "open-integration-dialog": { status: "inactive" },
    "open-export-dialog": { status: "inactive" },
    "open-import-dialog": { status: "inactive" },
    "open-add-integration-dialog": { status: "inactive" },
  },

  activateCommand: (command, data) =>

    set((state) => ({
      latestCommand: command,
      commandMap: {
        ...state.commandMap,
        [command]: { status: "pending", data },
      },
    })),

  removeCommand: (command) =>
    set((state) => {
      let newLatest = state.latestCommand
      if (newLatest === command) {
        newLatest = Object.keys(state.commandMap)
          .find(commandKey => state.commandMap[commandKey as CommandTypes].status === "pending" && commandKey !== command) as CommandTypes ?? ""
      }
      return ({
        latestCommand: newLatest,
        commandMap: {
          ...state.commandMap,
          [command]: { status: "inactive", data: undefined },
        },
      })
    })
  ,
}));
