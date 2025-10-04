"use client"
import Dock from '@/components/ui/dock/Dock';
import { Blocks, FileText, Layers, LineSquiggle, LinkIcon, Plus, Settings, Type } from "lucide-react";
import { useCommandStore } from './commandStore';
import { useNewDraftNode } from '@/components/nodes/arkt/utils';
import { HiDotsHorizontal } from '@/lib/icons/Icons';
import useTemplatesStateSynced from '@/components/yjs/useTemplatesStateSynced';
import { TemplateIcon } from '@/components/templates/TemplateIcon';
import { useRouter } from 'next/navigation';



export default function MobileDock() {
    const activateCommand = useCommandStore((s) => s.activateCommand);
    const { getNewDraftArktNode: getNewDraftNode, getNewDraftTextNode } = useNewDraftNode(true);
    const [templates] = useTemplatesStateSynced();
    const router = useRouter();

    const items = [
        { icon: <Type size={18} />, label: 'Add text', onClick: () => activateCommand("add-node", { nodes: [getNewDraftTextNode()] }) },
        {
            icon: <Layers size={18} />, label: 'Add Node', onClick: () => activateCommand('add-node', { nodes: [getNewDraftNode()] }),
        },
        {
            icon: <HiDotsHorizontal />, label: 'More', onClick: () => alert('Profile!'), subItems: [
                { icon: <LinkIcon size={18} />, label: 'Virtual Node', onClick: () => activateCommand("open-add-virtual-dialog") },
                { icon: <Blocks size={18} />, label: 'Integration Node', onClick: () => activateCommand("open-add-integration-dialog") },
                { icon: <LineSquiggle size={18} />, label: 'Line', onClick: () => activateCommand("freehand-mode") },
            ]
        },
        {
            icon: <FileText size={18} />, label: 'Open templates',
            subItems: [...templates.map((t) => ({
                icon: <TemplateIcon key={t.id} iconKey={t.iconKey} fillColor={t.fillColor} strokeColor={t.strokeColor} />,
                label: t.name,
                onClick: () => activateCommand("add-node", {
                    nodes: [getNewDraftNode(t)]

                })
            })),
            { icon: <Plus size={18} />, label: 'Create template', onClick: () => { activateCommand("open-create-template") } }
            ]
        },
        { icon: <Settings size={18} />, label: 'Settings', onClick: () => router.push("/design/settings") },

    ];

    return (
        <div className="block md:hidden fixed bottom-0 left-0 right-0">
            <Dock
                items={items}
                panelHeight={68}
                baseItemSize={50}
                magnification={70}
            />
        </div>
    )
}