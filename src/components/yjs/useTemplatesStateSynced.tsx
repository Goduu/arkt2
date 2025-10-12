import { useCallback, useEffect, useState } from 'react';

import ydoc from './ydoc';
import { DEFAULT_PATH_ID } from './constants';
import { TemplateData } from '../templates/types';
import useUserDataStateSynced from './useUserStateSynced';

// We are using nodesMap as the one source of truth for the nodes.
// This means that we are doing all changes to the nodes in the map object.
// Whenever the map changes, we update the nodes state.
export const templatesMap = ydoc.getMap<TemplateData>('templates');

function useTemplatesStateSynced(): [
  TemplateData[],
  React.Dispatch<React.SetStateAction<TemplateData[]>>
] {
  const { currentUserData } = useUserDataStateSynced();
  const currentDiagramId = currentUserData?.currentDiagramId || DEFAULT_PATH_ID

  const [templates, setTemplates] = useState<TemplateData[]>([]);

  const setTemplatesSynced = useCallback(
    (templatesOrUpdater: React.SetStateAction<TemplateData[]>) => {
      const seen = new Set<string>();
      const next =
        typeof templatesOrUpdater === 'function'
          ? templatesOrUpdater([...templatesMap.values()])
          : templatesOrUpdater;

      for (const template of next) {
        seen.add(template.id);
        templatesMap.set(template.id, template);
      }

      for (const template of templatesMap.values()) {
        if (!seen.has(template.id)) {
          templatesMap.delete(template.id);
        }
      }
    },
    []
  );

  // here we are observing the templatesMap and updating the templates state whenever the map changes.
  useEffect(() => {
    const observer = () => {
      const templatesList = Array.from(templatesMap.values())

      setTemplates(templatesList);
    };

    const initialTemplates = Array.from(templatesMap.values()).filter(
      (template) => template && template.id
    );
    setTemplates(initialTemplates);
    templatesMap.observe(observer);

    return () => templatesMap.unobserve(observer);
  }, [setTemplates, currentDiagramId]);

  return [templates, setTemplatesSynced];
}

export default useTemplatesStateSynced;
