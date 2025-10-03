"use client";

import * as React from "react";
import { Download, Upload } from "lucide-react";
import { SegmentBreadCrumb } from "@/components/SegmentBreadCrumb";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import SketchySideBorder from "@/components/sketchy/SketchySideBorder";
import { useCommandStore } from "../commandStore";
import { CollabPopover } from "@/components/yjs/CollabPopover";
// import { importFromEnvelopeText } from "./exportImport";

export function TopBar() {
  const activateCommand = useCommandStore((s) => s.activateCommand);
  // Breadcrumb root is always the current diagram for independent diagrams

  const fileRef = React.useRef<HTMLInputElement>(null);
  const onExportClick = (): void => {
    activateCommand("open-export-dialog")
  }
  const onImportClick = (): void => {
    activateCommand("open-import-dialog")
  }

  return (
    <div className="pb-3 flex items-center gap-2 px-4 py-2 bg-background/60 backdrop-blur supports-[backdrop-filter]:bg-background/80 sticky top-0 z-50">
      <SegmentBreadCrumb />
      <div className="ml-auto flex items-center gap-2">
        <Input ref={fileRef} type="file" accept="application/json" className="hidden" />
        <Button size="sm" variant="ghost" onClick={onImportClick}>
          <Upload className="mr-2 h-4 w-4" /> Import
        </Button>
        <Button size="sm" variant="ghost" onClick={onExportClick}>
          <Download className="mr-2 h-4 w-4" /> Export
        </Button>
        <CollabPopover />
      </div>
      <SketchySideBorder seed={1} side="bottom" strokeColor={{ family: "neutral", indicative: "low" }} strokeWidth={1}roughness={1.1}/>
    </div>
  );
}


