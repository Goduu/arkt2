import { create } from 'zustand';
import { type XYPosition } from '@xyflow/react';

// Define specific data types for each command
type OpenCreateTemplateData = {
  templateId?: string;
};

type Command<T = unknown> = {
  status: "pending" | "inactive";
  data?: T;
};

type CommandTypes = "open-templates-manager" | "open-create-template" | "freehand-mode";

// Create a mapped type for better type safety
type CommandMap = {
  "open-templates-manager": Command;
  "open-create-template": Command<OpenCreateTemplateData>;
  "freehand-mode": Command;
};

interface AppState {
  connectionLinePath: XYPosition[];
  setConnectionLinePath: (connectionLinePath: XYPosition[]) => void;
  commandMap: CommandMap;
  activateCommand: <K extends CommandTypes>(command: K, data?: CommandMap[K]['data']) => void;
  removeCommand: (command: CommandTypes) => void;
}

export const useAppStore = create<AppState>((set) => ({
  connectionLinePath: [],
  setConnectionLinePath: (connectionLinePath) => set({ connectionLinePath }),

  commandMap: {
    "open-templates-manager": { status: "inactive" },
    "open-create-template": { status: "inactive" },
    "freehand-mode": { status: "inactive" },
  },

  activateCommand: (command, data) =>
    set((state) => ({
      commandMap: {
        ...state.commandMap,
        [command]: { status: "pending", data },
      },
    })),

  removeCommand: (command) =>
    set((state) => ({
      commandMap: {
        ...state.commandMap,
        [command]: { status: "inactive", data: undefined },
      },
    })),
}));
