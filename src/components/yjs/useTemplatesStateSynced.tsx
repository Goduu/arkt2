import { useCallback, useEffect, useState } from 'react';

import ydoc from './ydoc';
import { syncYMapFromState } from './mapSync';
import { TemplateData } from '../templates/types';

// We are using nodesMap as the one source of truth for the nodes.
// This means that we are doing all changes to the nodes in the map object.
// Whenever the map changes, we update the nodes state.
export const templatesMap = ydoc.getMap<TemplateData>('templates');

function useTemplatesStateSynced(): [
  TemplateData[],
  React.Dispatch<React.SetStateAction<TemplateData[]>>
] {
  const [templates, setTemplates] = useState<TemplateData[]>([]);

  const setTemplatesSynced = useCallback(
    (templatesOrUpdater: React.SetStateAction<TemplateData[]>) => {
      try {
        const next =
          typeof templatesOrUpdater === 'function'
            ? templatesOrUpdater([...templatesMap.values()])
            : templatesOrUpdater;

        syncYMapFromState(templatesMap, next, 'templates-sync');
      } catch (error) {
        console.error('Error syncing templates:', error);
      }
    },
    []
  );

  // here we are observing the templatesMap and updating the templates state whenever the map changes.
  useEffect(() => {
    const observer = () => {
      try {
        const templatesList = Array.from(templatesMap.values())

        setTemplates(templatesList);
      } catch (error) {
        console.error('Error in templates observer:', error);
      }
    };

    const initialTemplates = Array.from(templatesMap.values()).filter(
      (template) => template && template.id
    );
    setTemplates(initialTemplates);
    templatesMap.observe(observer);

    return () => templatesMap.unobserve(observer);
  }, [setTemplates]);

  return [templates, setTemplatesSynced];
}

export default useTemplatesStateSynced;
