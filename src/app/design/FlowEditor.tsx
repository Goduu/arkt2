'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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
  OnNodesChange,
  applyNodeChanges,
  OnConnectEnd,
  Connection
} from '@xyflow/react';

import '@xyflow/react/dist/style.css';
import { useCommandStore } from './commandStore';
import { ConnectionLine } from '../../components/edges/ConnectionLine';
import { ArktNodeComponent } from '../../components/nodes/arkt/ArktNode';
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
import { useDraggableNode } from '@/components/nodes/useDraggableNode';
import { StatusIcon } from './status-icon/StatusIcon';
import { ArchTextNodeComponent } from '@/components/nodes/text/ArchTextNode';
import { ChatBubble } from '@/components/chat/ChatBubble';
import { IntegrationNodeComponent } from '@/components/nodes/integrations/IntegrationNode';
import { getProvider, disconnectProvider } from '@/components/yjs/ydoc';
import { useSearchParams } from 'next/navigation';
import { HelpLinesToggle } from './status-icon/HelpLinesToggle';
import { useIsMobile } from '@/hooks/use-mobile';
import { createEdgeFromConnection } from '@/components/edges/ArktEdge/path/utils';
import { useNewDraftNode } from '@/components/nodes/arkt/utils';
import { ArktNode } from '@/components/nodes/arkt/types';
import { ArktEdge } from '@/components/edges/ArktEdge/type';

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
  const isMobile = useIsMobile();
  const { getNodes, screenToFlowPosition } = useReactFlow();
  const [nodes, setNodes, onNodesChange] = useNodesStateSynced();
  const [edges, setEdges, onEdgesChange] = useEdgesStateSynced();
  const { takeSnapshot } = useUndoRedo();
  const { rebuildIndex, updateHelperLines, HelperLines } = useHelperLines();
  const { currentUserData } = useUserDataStateSynced();
  const currentPath = currentUserData?.currentDiagramId || DEFAULT_PATH_ID;
  const [isDrawing, setIsDrawing] = useState(false);
  const [, cursors, onMouseMove] = useCursorStateSynced();
  const freehandModeCommand = useCommandStore((s) => s.commandMap["freehand-mode"]);
  const { draggingNodesRef, mouseMoveHandler, dropHandler } = useDraggableNode();
  const searchParams = useSearchParams();
  const prevCollabRef = useRef<string | null>(null);
  const helpLinesStatus = useCommandStore((s) => s.commandMap["help-lines-toggle"].status);
  const showHelpLines = helpLinesStatus === "active"
  const { getNewDraftArktNode } = useNewDraftNode();

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

  const handleMouseMove = useCallback((event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    onMouseMove(event);
    if (draggingNodesRef.current.length > 0) {
      mouseMoveHandler(event);
    }
  }, [onMouseMove]);


  const onConnect: OnConnect = useCallback(
    (connection) => {
      const { connectionLinePath } = useCommandStore.getState();

      const edge = createEdgeFromConnection(connection, connectionLinePath, currentPath);
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
    [getNodes, showHelpLines, updateHelperLines, onNodesChange]
  );

  const onConnectEnd: OnConnectEnd = useCallback(
    (event, connectionState) => {
      // when a connection is dropped on the pane it's not valid
      if (connectionState.isValid || !connectionState.fromNode?.id) {
        return
      }
      // we need to remove the wrapper bounds, in order to get the correct position
      const { clientX, clientY } ='changedTouches' in event ? event.changedTouches[0] : event;

      const newNode: ArktNode = {
        ...getNewDraftArktNode(),
        position: screenToFlowPosition({
          x: clientX,
          y: clientY,
        }),
      }

      const connection: Connection = {
        source: connectionState.fromHandle?.nodeId || "",
        target: connectionState.toHandle?.nodeId || "",
        sourceHandle: connectionState.fromHandle?.id || "",
        targetHandle: connectionState.toHandle?.id || ""
      }

      setNodes((nds) => nds.concat(newNode));
      const newEdge: ArktEdge = {
        ...createEdgeFromConnection(connection, [], currentPath),
        source: connectionState.fromNode?.id,
        target: newNode.id,
      }
      setEdges((eds) =>
        eds.concat(newEdge),
      );
    },
    [screenToFlowPosition],
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

  const selectedNodes = useMemo(() => nodes.filter((node) => node.selected), [nodes]);

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 min-h-0 relative">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          className={isMobile ? 'touch-flow' : ''}
          onNodesChange={handleNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onConnectEnd={onConnectEnd}
          onPointerMove={handleMouseMove}
          onNodeDragStart={onNodeDragStart}
          onNodeDragStop={onNodeDragStop}
          onSelectionDragStart={onSelectionDragStart}
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
          connectOnClick={isMobile}
          // onSelect={handleSelectionChange}
          fitView
          fitViewOptions={fitViewOptions}
          snapToGrid={showHelpLines}
          onClick={draggingNodesRef.current.length > 0 ? dropHandler : undefined}
        >

          {isDrawing && <Freehand setNodes={setNodes} setIsDrawing={setIsDrawing} />}
          <Background />
          <Panel position="bottom-left" className='hidden md:flex flex-col gap-2 justify-start'>
            <HelpLinesToggle />
            <StatusIcon />
          </Panel>
          {showHelpLines &&
            <HelperLines />
          }
          <MiniMap className='hidden md:block' bgColor='transparent' maskColor='transparent' maskStrokeColor='#888' />
          <ChatBubble />
          <Cursors cursors={cursors} />
        </ReactFlow>
        <EdgeControls />
        <NodeControls selectedNodes={selectedNodes} />
      </div>
    </div>

  );
}
