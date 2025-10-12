'use client';

import { createContext, useContext, ReactNode } from 'react';
import { FitView } from '@xyflow/react';
import useUserDataStateSynced, { UserData } from './useUserStateSynced';
import { CollaborationErrorBoundary } from './CollaborationErrorBoundary';

interface UserDataContextValue {
  currentUserData: UserData | undefined;
  usersData: UserData[];
  onDiagramDrillDown: (newDiagramId: string, newDiagramLabel: string) => void;
  onDiagramDrillUp: () => void;
  onDiagramDrillToIndex: (index: number) => void;
  onChangeNodeLabel: (nodeId: string, label: string) => void;
  onDiagramDrillToNode: (targetNodeId: string) => void;
}

const UserDataContext = createContext<UserDataContextValue | undefined>(undefined);

export function UserDataProvider({ children, fitView }: { children: ReactNode; fitView?: FitView }) {
  const value = useUserDataStateSynced(fitView);

  return (
    <CollaborationErrorBoundary>
      <UserDataContext.Provider value={value}>
        {children}
      </UserDataContext.Provider>
    </CollaborationErrorBoundary>
  );
}

/**
 * Hook to access user data context.
 * Returns undefined if not within a UserDataProvider (e.g., on landing page).
 * Use this when the context is optional.
 */
export function useUserData() {
  const context = useContext(UserDataContext);
  return context;
}

/**
 * Hook that requires UserDataProvider context.
 * Throws an error if not within a provider.
 * Use this in components that must have the provider.
 */
export function useRequiredUserData() {
  const context = useContext(UserDataContext);
  if (context === undefined) {
    throw new Error('useRequiredUserData must be used within a UserDataProvider');
  }
  return context;
}

