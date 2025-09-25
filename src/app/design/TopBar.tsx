"use client";

import * as React from "react";
import { Download, Upload } from "lucide-react";
import { SegmentBreadCrumb } from "@/components/SegmentBreadCrumb";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import SketchySideBorder from "@/components/sketchy/SketchySideBorder";

export function TopBar() {
  // Breadcrumb root is always the current diagram for independent diagrams

  const fileRef = React.useRef<HTMLInputElement>(null);
  const onImportClick = (): void => { try { window.dispatchEvent(new Event("arkt:trigger-import")); } catch { console.warn("Error dispatching event for trigger import"); } }
  const onImport: React.ChangeEventHandler<HTMLInputElement> = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // const text = await file.text();
    try {
      // const parsed = JSON.parse(text);
      // setPendingCommand({ type: "import", data: parsed });
    } catch {
      // ignore invalid file
    } finally {
      // reset value so selecting the same file again triggers onChange
      if (e.currentTarget) {
        e.currentTarget.value = "";
      }
    }
  };

  return (
    <div className="pb-3 flex items-center gap-2 px-4 py-2 bg-background/60 backdrop-blur supports-[backdrop-filter]:bg-background/80 sticky top-0 z-50">
      <SegmentBreadCrumb />
      <div className="ml-auto flex items-center gap-2">
        <Input ref={fileRef} type="file" accept="application/json" className="hidden" onChange={onImport} />
        <Button fillColor={{ family: "slate", indicative: "low" }} size="sm" variant="ghost" onClick={onImportClick}>
          <Upload className="mr-2 h-4 w-4" /> Import
        </Button>
        <Button fillColor={{ family: "slate", indicative: "low" }} size="sm" variant="ghost" onClick={() => {}}>
          <Download className="mr-2 h-4 w-4" /> Export
        </Button>
      </div>
      <SketchySideBorder seed={1} side="bottom" strokeColor={{ family: "slate", indicative: "low" }} strokeWidth={1} />
    </div>
  );
}


