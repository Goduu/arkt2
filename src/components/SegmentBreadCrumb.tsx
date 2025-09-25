import { useMemo } from "react";
import {
    Breadcrumb,
    BreadcrumbEllipsis,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import useUserDataStateSynced from "./yjs/useUserStateSynced";
import { DEFAULT_PATH_ID, DEFAULT_PATH_LABEL } from "./yjs/constants";
import { useReactFlow } from "@xyflow/react";

export function SegmentBreadCrumb() {
    const { fitView } = useReactFlow();
    const { currentUserData, onDiagramDrillToIndex } = useUserDataStateSynced(fitView);
    const path = currentUserData?.currentDiagramPath || [];
    console.log("path", path);

    type Item = {
        key: string;
        label: string;
        onClick?: () => void;
    };

    const segmentItems: Item[] = useMemo(() => {
        const normalized = Array.isArray(path) ? path : [];
        return normalized.map((seg, idx) => ({
            key: seg.id,
            label: seg.id === DEFAULT_PATH_ID ? DEFAULT_PATH_LABEL : (seg.label ?? "Unknown"),
            onClick: () => onDiagramDrillToIndex?.(idx),
        }));
    }, [path, onDiagramDrillToIndex]);

    // With new currentUserData path, drill items are already represented in segmentItems
    const drillItems: Item[] = useMemo(() => [], []);

    const combined: Item[] = [...segmentItems, ...drillItems];
    const total = combined.length;

    const renderLink = (item: Item, isLast: boolean) => (
        <BreadcrumbItem key={item.key}>
            {isLast ? (
                <BreadcrumbPage>{item.label}</BreadcrumbPage>
            ) : (
                <BreadcrumbLink asChild>
                    <a href="#" onClick={(e) => { e.preventDefault(); item.onClick?.(); }}>{item.label}</a>
                </BreadcrumbLink>
            )}
        </BreadcrumbItem>
    );

    const renderAll = () => {
        const nodes: React.ReactNode[] = [];
        combined.forEach((item, idx) => {
            const isLast = idx === total - 1;
            nodes.push(renderLink(item, isLast));
            if (!isLast) nodes.push(<BreadcrumbSeparator key={`sep-${item.key}`} />);
        });
        return nodes;
    };

    const renderCollapsed = () => {
        const first = combined[0];
        const tail = combined.slice(-3);
        const nodes: React.ReactNode[] = [];
        // first
        nodes.push(renderLink(first, false));
        nodes.push(<BreadcrumbSeparator key={`sep-first`} />);
        // ellipsis (not interactive)
        nodes.push(
            <BreadcrumbItem key="ellipsis">
                <BreadcrumbEllipsis />
            </BreadcrumbItem>
        );
        nodes.push(<BreadcrumbSeparator key={`sep-ellipsis`} />);
        // last three
        tail.forEach((item, idx) => {
            const isLast = idx === tail.length - 1;
            nodes.push(renderLink(item, isLast));
            if (!isLast) nodes.push(<BreadcrumbSeparator key={`sep-tail-${idx}`} />);
        });
        return nodes;
    };

    return (
        <Breadcrumb data-testid="breadcrumb">
            <BreadcrumbList data-testid="breadcrumb-list">
                {total <= 5 ? renderAll() : renderCollapsed()}
            </BreadcrumbList>
        </Breadcrumb>
    );
}
