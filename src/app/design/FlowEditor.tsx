'use client';

import { useCallback, useEffect, useState } from 'react';
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
  OnSelectionChangeFunc,
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
import { FreehandNode } from '../../components/nodes/freehand/FreehandNode';
import { Freehand } from '../../components/nodes/freehand/Freehand';
import { Button } from '@/components/ui/button';
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

const nodeTypes = {
  arktNode: ArktNodeComponent,
  freehand: FreehandNode,
  text: ArchTextNodeComponent,
  integration: IntegrationNodeComponent,
};

export const edgeTypes = {
  'editable-edge': EditableEdgeComponent,
};

const fitViewOptions = { padding: 0.4 };

export default function FlowEditor() {
  // const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  // const [edges, setEdges, onEdgesChange] =
  //   useEdgesState<ArktEdge>(initialEdges);
  const { getNodes } = useReactFlow();
  const [nodes, setNodes, onNodesChange] = useNodesStateSynced();
  const [edges, setEdges, onEdgesChange] = useEdgesStateSynced();
  const { takeSnapshot } = useUndoRedo();
  const { rebuildIndex, updateHelperLines, HelperLines } = useHelperLines();
  const { currentUserData } = useUserDataStateSynced();
  const currentPath = currentUserData?.currentDiagramId || DEFAULT_PATH_ID;
  const [isDrawing, setIsDrawing] = useState(false);
  const [cursors, onMouseMove] = useCursorStateSynced();
  const [, setSelectedEdges] = useState<ArktEdge[]>([]);
  const [, setSelectedNodes] = useState<NodeUnion[]>([]);
  const freehandModeCommand = useCommandStore((s) => s.commandMap["freehand-mode"]);
  const { draggingNodesRef, mouseMoveHandler, dropHandler } = useDraggableNode();

  console.log('edges', edges);

  useCopyPaste();

  useEffect(() => {
    if (freehandModeCommand.status === "pending") {
      setIsDrawing(true);
    }
  }, [freehandModeCommand]);

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
      console.log('connection', connection);
      // We add a new edge based on the selected DEFAULT_ALGORITHM
      // and transfer all the control points from the connectionLinePath
      // in case the user has added any while creating the connection
      const edge: ArktEdge = {
        ...connection,
        id: `${Date.now()}-${connection.source}-${connection.target}`,
        type: 'editable-edge',
        selected: true,
        data: {
          algorithm: DEFAULT_ALGORITHM,
          pathId: currentPath || DEFAULT_PATH_ID,
          strokeColor: DEFAULT_STROKE_COLOR,
          strokeWidth: 2,
          fontSize: 12,
          labelFill: { family: "base", indicative: "low" },
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
      setNodes((nodes) => {
        const updatedChanges = updateHelperLines(changes, nodes);
        onNodesChange(updatedChanges);
        return applyNodeChanges(updatedChanges, nodes);
      });
    },
    [setNodes, updateHelperLines],
  );

  const onNodeDragStop = useCallback(() => {
    rebuildIndex(getNodes());
  }, [getNodes, rebuildIndex]);

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
          onClick={draggingNodesRef.current.length > 0 ? dropHandler : undefined}
        >

          {isDrawing && <Freehand setNodes={setNodes} setIsDrawing={setIsDrawing} />}
          <Background />
          <Panel position="top-left">
            <Button onClick={() => {
              setNodes(nodes => [...nodes,
              {
                id: '1',
                type: 'integration',
                data: { type: 'github', pathId: currentPath || DEFAULT_PATH_ID },
                position: { x: 0, y: 0 },
              }]);
            }}>
              Add Integration
            </Button>
            <Button onClick={() => {
              setNodes([]);
              setEdges([]);
            }}>
              Reset
            </Button>
          </Panel>
          <HelperLines />
          <MiniMap bgColor='transparent' maskColor='transparent' maskStrokeColor='#888' />
          <ChatBubble />
          <Cursors cursors={cursors} />
          <div className='absolute bottom-2 left-2'>
            <StatusIcon />
          </div>
        </ReactFlow>
        <EdgeControls />
        <NodeControls />
      </div>
    </div>

  );
}
