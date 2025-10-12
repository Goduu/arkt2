'use client';

import { useReactFlow } from '@xyflow/react';
import { UserDataProvider } from '@/components/yjs/UserDataContext';
import FlowEditor from './FlowEditor';
import { Suspense } from 'react';

export function FlowEditorWithProvider() {
  const { fitView } = useReactFlow();
  
  return (
    <UserDataProvider fitView={fitView}>
      <Suspense fallback={<div>Loading editor...</div>}>
        <FlowEditor />
      </Suspense>
    </UserDataProvider>
  );
}

