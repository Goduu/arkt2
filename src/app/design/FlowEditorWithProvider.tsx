'use client';

import { useReactFlow } from '@xyflow/react';
import { UserDataProvider } from '@/components/yjs/UserDataContext';
import FlowEditor from './FlowEditor';

export function FlowEditorWithProvider() {
  const { fitView } = useReactFlow();
  
  return (
    <UserDataProvider fitView={fitView}>
      <FlowEditor />
    </UserDataProvider>
  );
}

