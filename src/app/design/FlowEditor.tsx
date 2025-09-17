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
import { useAppStore } from './store';
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
import { ModeToggle } from '../../components/ModeToggle';
import { Button } from '@/components/ui/button';
import { NodeUnion } from '../../components/nodes/types';
import useUserDataStateSynced from '../../components/yjs/useUserStateSynced';
import { SegmentBreadCrumb } from '../../components/SegmentBreadCrumb';
import { EditableEdgeComponent } from '../../components/edges/ArktEdge';
import { nanoid } from 'nanoid';
import { DEFAULT_PATH_ID } from '@/components/yjs/constants';
import { EdgeControls } from '@/components/controls/EdgeControls';
import { NodeControls } from '@/components/controls/node-controls/NodeControls';
import { DEFAULT_STROKE_COLOR } from '@/components/colors/utils';

const nodeTypes = {
  arktNode: ArktNodeComponent,
  freehand: FreehandNode,
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
  const { undo, redo, canUndo, canRedo, takeSnapshot } = useUndoRedo();
  const { cut, copy, paste, bufferedNodes } = useCopyPaste();
  const { rebuildIndex, updateHelperLines, HelperLines } = useHelperLines();
  const { currentUserData, usersData } = useUserDataStateSynced();
  const currentPath = currentUserData?.currentDiagramId || DEFAULT_PATH_ID;
  const [isDrawing, setIsDrawing] = useState(false);
  const [cursors, onMouseMove] = useCursorStateSynced();
  const [selectedEdges, setSelectedEdges] = useState<ArktEdge[]>([]);
  const [selectedNodes, setSelectedNodes] = useState<NodeUnion[]>([]);
  const freehandModeCommand = useAppStore((s) => s.commandMap["freehand-mode"]);
  const { removeCommand } = useAppStore();

  useEffect(() => {
    if (freehandModeCommand.status === "pending") {
      setIsDrawing(true);
      removeCommand("freehand-mode");
    }
  }, [freehandModeCommand]);

  const handleSelectionChange: OnSelectionChangeFunc<NodeUnion, ArktEdge> = (selection) => {
    const edges = selection.edges
    setSelectedEdges(edges);
    const nodes = selection.nodes
    setSelectedNodes(nodes);
  }


  const onConnect: OnConnect = useCallback(
    (connection) => {
      const { connectionLinePath } = useAppStore.getState();
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

  return (
    <div className="w-screen h-screen">
      <SegmentBreadCrumb />

      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={handleNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onPointerMove={onMouseMove}
        onNodeDragStart={onNodeDragStart}
        onNodeDragStop={onNodeDragStop}
        onSelectionDragStart={onSelectionDragStart}
        onSelectionChange={handleSelectionChange}
        onNodesDelete={onNodesDelete}
        onEdgesDelete={onEdgesDelete}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        elevateNodesOnSelect
        elevateEdgesOnSelect
        connectionMode={ConnectionMode.Loose}
        connectionLineComponent={ConnectionLine}
        panOnDrag={!isDrawing}
        zoomOnScroll={!isDrawing}
        panOnScroll={!isDrawing}
        selectNodesOnDrag={!isDrawing}
        fitView
        fitViewOptions={fitViewOptions}
      >

        {isDrawing && <Freehand setNodes={setNodes} />}
        <Background />
        <Panel position="top-left">
          <Button onClick={() => {
            setNodes([]);
            setEdges([]);
          }}>
            Reset
          </Button>
          <Button
            className='cursor-pointer'
            onClick={() => {
              console.log('currentPath', currentPath)
              setNodes([...nodes, {
                id: nanoid(),
                type: 'arktNode',
                width: 90,
                height: 60,
                data: {
                  pathId: currentPath || DEFAULT_PATH_ID,
                  label: "New Node"
                },
                position: { x: 0, y: 0 },
              }]);
            }}>
            Add Node
          </Button>
          <Button
            className={`xy-theme__button ${isDrawing ? 'active' : ''}`}
            onClick={() => setIsDrawing(isDrawing => !isDrawing)}
          >
            {isDrawing ? 'Drawing Mode' : 'Freehand Mode'}
          </Button>
          <ModeToggle />
        </Panel>
        <HelperLines />
        <MiniMap />
        <Cursors cursors={cursors} />
      </ReactFlow>
      <EdgeControls
        selectedEdges={selectedEdges}
        onChange={(edge) => {
          setEdges(edges.map((e) => (e.id === edge.id ? edge : e)));
        }}
      />
      <NodeControls />
    </div>

  );
}
