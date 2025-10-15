'use client';

import { useReactFlow } from '@xyflow/react';
import { UserDataProvider } from '@/components/yjs/UserDataContext';
import FlowEditor from './FlowEditor';
import { Suspense } from 'react';
import LoadingPage from './LoadingPage';

export function FlowEditorWithProvider() {
  const { fitView } = useReactFlow();
  
  return (
    <UserDataProvider fitView={fitView}>
      <Suspense fallback={<LoadingPage />}>
        <FlowEditor />
      </Suspense>
    </UserDataProvider>
  );
}

