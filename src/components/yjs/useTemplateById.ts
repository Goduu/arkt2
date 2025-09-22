"use client";

import { useEffect, useState } from "react";
import ydoc from "./ydoc";
import { TemplateData } from "../templates/types";
import type { YMapEvent } from "yjs";

const templatesMap = ydoc.getMap<TemplateData>("templates");

export function useTemplateById(templateId?: string): TemplateData | undefined {
  const [template, setTemplate] = useState<TemplateData | undefined>(() =>
    templateId ? templatesMap.get(templateId) : undefined
  );

  useEffect(() => {
    if (!templateId) {
      setTemplate(undefined);
      return;
    }

    const update = () => {
      setTemplate(templatesMap.get(templateId));
    };

    // initialize
    update();

    const observer = (event: YMapEvent<TemplateData>) => {
      // Only update when the specific key changes
      if (event.keysChanged.has(templateId)) {
        update();
      }
    };

    templatesMap.observe(observer);
    return () => {
      templatesMap.unobserve(observer);
    };
  }, [templateId]);

  return template;
}

export default useTemplateById;


