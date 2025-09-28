'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ReactFlow,
  Background,
  ConnectionMode,
  OnConnect,
  Panel,
  addEdge, MiniMap,
  OnNodeDrag,
  SelectionDragHandler,
  OnNodesDelete,
  OnEdgesDelete,
  useReactFlow,
  OnNodesChange, OnSelectionChangeFunc,
  applyNodeChanges
} from '@xyflow/react';

import '@xyflow/react/dist/style.css';
import { useCommandStore } from './commandStore';
import { ConnectionLine } from '../../components/edges/ConnectionLine';
import { DEFAULT_ALGORITHM } from '../../components/edges/ArktEdge/constants';
import { ArktNodeComponent } from '../../components/nodes/arkt/ArktNode';
import { ArktEdge, ControlPointData } from '../../components/edges/ArktEdge/type';
import Cursors from '../../components/yjs/Cursors';
import useCursorStateSynced from '../../components/yjs/useCursorStateSynced';
import useNodesStateSynced from '../../components/yjs/useNodesStateSynced';
import useEdgesStateSynced from '../../components/yjs/useEdgesStateSynced';
import useUndoRedo from '../hooks/useUndoRedo';
import useCopyPaste from '../hooks/useCopyPast';
import { useHelperLines } from '../../components/helper-lines/useHelperLines';
import { FreehandNodeComponent } from '../../components/nodes/freehand/FreehandNode';
import { Freehand } from '../../components/nodes/freehand/Freehand';
import { NodeUnion } from '../../components/nodes/types';
import useUserDataStateSynced from '../../components/yjs/useUserStateSynced';
import { EditableEdgeComponent } from '../../components/edges/ArktEdge';
import { DEFAULT_PATH_ID } from '@/components/yjs/constants';
import { EdgeControls } from '@/components/controls/EdgeControls';
import { NodeControls } from '@/components/controls/node-controls/NodeControls';
import { DEFAULT_STROKE_COLOR } from '@/components/colors/utils';
import { useDraggableNode } from '@/components/nodes/useDraggableNode';
import { StatusIcon } from './status-icon/StatusIcon';
import { ArchTextNodeComponent } from '@/components/nodes/text/ArchTextNode';
import { ChatBubble } from '@/components/chat/ChatBubble';
import { IntegrationNodeComponent } from '@/components/nodes/arkt/integrations/IntegrationNode';
import { getProvider, disconnectProvider } from '@/components/yjs/ydoc';
import { useSearchParams } from 'next/navigation';
import { Grid2X2Check } from 'lucide-react';
import { HelpLinesToggle } from './status-icon/HelpLinesToggle';

export const nodeTypes = {
  arktNode: ArktNodeComponent,
  freehand: FreehandNodeComponent,
  text: ArchTextNodeComponent,
  integration: IntegrationNodeComponent,
};

export const edgeTypes = {
  'arktEdge': EditableEdgeComponent,
};

const fitViewOptions = { padding: 0.4 };

export default function FlowEditor() {
  const { getNodes } = useReactFlow();
  const [nodes, setNodes, onNodesChange] = useNodesStateSynced();
  const [edges, setEdges, onEdgesChange] = useEdgesStateSynced();
  const { takeSnapshot } = useUndoRedo();
  const { rebuildIndex, updateHelperLines, HelperLines } = useHelperLines();
  const { currentUserData } = useUserDataStateSynced();
  const currentPath = currentUserData?.currentDiagramId || DEFAULT_PATH_ID;
  const [isDrawing, setIsDrawing] = useState(false);
  const [, cursors, onMouseMove] = useCursorStateSynced();
  const [, setSelectedEdges] = useState<ArktEdge[]>([]);
  const [, setSelectedNodes] = useState<NodeUnion[]>([]);
  const freehandModeCommand = useCommandStore((s) => s.commandMap["freehand-mode"]);
  const { draggingNodesRef, mouseMoveHandler, dropHandler } = useDraggableNode();
  const searchParams = useSearchParams();
  const prevCollabRef = useRef<string | null>(null);
  const helpLinesStatus = useCommandStore((s) => s.commandMap["help-lines-toggle"].status);
  const showHelpLines = helpLinesStatus === "active"

  useCopyPaste();

  useEffect(() => {
    if (freehandModeCommand.status === "pending") {
      setIsDrawing(true);
    }
  }, [freehandModeCommand]);

  // Ensure Yjs provider is initialized when the collab room changes via client-side navigation
  useEffect(() => {
    const collab = searchParams.get('collab');
    const prev = prevCollabRef.current;

    if (prev && prev !== collab) {
      // Leaving previous room: disconnect to remove presence immediately
      disconnectProvider();
    }

    // Entering a room (or staying in the same one): ensure provider is connected
    void getProvider();

    prevCollabRef.current = collab;
  }, [searchParams]);

  const handleSelectionChange: OnSelectionChangeFunc<NodeUnion, ArktEdge> = (selection) => {
    const edges = selection.edges
    setSelectedEdges(edges);
    const nodes = selection.nodes
    setSelectedNodes(nodes);
  }

  const handleMouseMove = useCallback((event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    onMouseMove(event);
    if (draggingNodesRef.current.length > 0) {
      mouseMoveHandler(event);
    }
  }, [onMouseMove]);


  const onConnect: OnConnect = useCallback(
    (connection) => {
      const { connectionLinePath } = useCommandStore.getState();
      // We add a new edge based on the selected DEFAULT_ALGORITHM
      // and transfer all the control points from the connectionLinePath
      // in case the user has added any while creating the connection
      const edge: ArktEdge = {
        ...connection,
        id: `${Date.now()}-${connection.source}-${connection.target}`,
        type: 'arktEdge',
        selected: true,
        data: {
          algorithm: DEFAULT_ALGORITHM,
          pathId: currentPath || DEFAULT_PATH_ID,
          strokeColor: DEFAULT_STROKE_COLOR,
          strokeWidth: 2,
          fontSize: 12,
          labelFill: { family: "base", indicative: "low" },
          direction: "none",
          points: connectionLinePath.map(
            (point, i) =>
            ({
              ...point,
              id: window.crypto.randomUUID(),
              prev: i === 0 ? undefined : connectionLinePath[i - 1],
              active: true,
            } satisfies ControlPointData)
          ),
        },
      };
      takeSnapshot();
      setEdges((edges) => addEdge(edge, edges));
    },
    [setEdges]
  );

  const onNodeDragStart: OnNodeDrag = useCallback(() => {
    // 👇 make dragging a node undoable
    takeSnapshot();
    // 👉 you can place your event handlers here
  }, [takeSnapshot]);

  const handleNodesChange: OnNodesChange<NodeUnion> = useCallback(
    (changes) => {
      const prev = getNodes();
      if (!showHelpLines) {
        onNodesChange(changes);
        return
      }
      const updatedChanges = updateHelperLines(changes, prev);
      applyNodeChanges(updatedChanges, nodes);
      onNodesChange(updatedChanges);
    },
    [updateHelperLines],
  );

  const onNodeDragStop = useCallback(() => {
    if (!showHelpLines) return

    rebuildIndex(getNodes());
  }, [getNodes, rebuildIndex, showHelpLines]);

  const onSelectionDragStart: SelectionDragHandler = useCallback(() => {
    // 👇 make dragging a selection undoable
    takeSnapshot();
  }, [takeSnapshot]);

  const onNodesDelete: OnNodesDelete = useCallback(() => {
    // 👇 make deleting nodes undoable
    takeSnapshot();
  }, [takeSnapshot]);

  const onEdgesDelete: OnEdgesDelete = useCallback(() => {
    // 👇 make deleting edges undoable
    takeSnapshot();
  }, [takeSnapshot]);

  const proOptions = { hideAttribution: true };


  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 min-h-0 relative">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={handleNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onPointerMove={handleMouseMove}
          onNodeDragStart={onNodeDragStart}
          onNodeDragStop={onNodeDragStop}
          onSelectionDragStart={onSelectionDragStart}
          onSelectionChange={handleSelectionChange}
          onNodesDelete={onNodesDelete}
          onEdgesDelete={onEdgesDelete}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          elevateNodesOnSelect
          proOptions={proOptions}
          elevateEdgesOnSelect
          connectionMode={ConnectionMode.Loose}
          connectionLineComponent={ConnectionLine}
          panOnDrag={!isDrawing}
          zoomOnScroll={!isDrawing}
          panOnScroll={!isDrawing}
          selectNodesOnDrag={!isDrawing}
          fitView
          fitViewOptions={fitViewOptions}
          snapToGrid={showHelpLines}
          onClick={draggingNodesRef.current.length > 0 ? dropHandler : undefined}
        >

          {isDrawing && <Freehand setNodes={setNodes} setIsDrawing={setIsDrawing} />}
          <Background />
          <Panel position="bottom-left" className='flex flex-col gap-2 justify-start'>
            <HelpLinesToggle />
            <StatusIcon />
          </Panel>
          {showHelpLines &&
            <HelperLines />
          }
          <MiniMap bgColor='transparent' maskColor='transparent' maskStrokeColor='#888' />
          <ChatBubble />
          <Cursors cursors={cursors} />
        </ReactFlow>
        <EdgeControls />
        <NodeControls />
      </div>
    </div>

  );
}
