import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { useEffect, useState } from "react"
import { Check, Copy, Download, OctagonAlert } from "lucide-react"
import { nanoid } from "nanoid"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { prepareCollabShare } from "./ydoc"
import { toast } from "sonner"
import { useCommandStore } from "@/app/design/commandStore"
import { Badge } from "../ui/badge"

export function CollabDialog() {
    const activateCommand = useCommandStore((s) => s.activateCommand);
    const removeCommand = useCommandStore((state) => state.removeCommand)
    const openCollabDialogCommand = useCommandStore((state) => state.commandMap["open-collab-dialog"])
    const [isOpen, setIsOpen] = useState<boolean>(false)

    useEffect(() => {
        if (openCollabDialogCommand.status === "pending") {
            setIsOpen(true)
            removeCommand("open-collab-dialog")
        }
    })

    const searchParams = useSearchParams();
    const collab = searchParams.get("collab")
    const [sharingKey, setSharingKey] = useState<string>(collab || "")
    const [fullUrl, setFullUrl] = useState("");
    const pathname = usePathname()
    const router = useRouter();

    useEffect(() => {
        if (typeof window !== "undefined") {
            const url = `${window.location.origin}${pathname}`;
            setFullUrl(url);
        }
    }, [pathname]);

    const onShare = async (e: React.FormEvent) => {
        e.preventDefault()
        const hash = nanoid(36)
        setSharingKey(hash)

        // Seed the new room with local data before navigating
        try {
            await prepareCollabShare(hash)
        } catch {
           console.error('Failed to prepare collab share')
        }

        const params = new URLSearchParams(searchParams);
        params.set("collab", hash)
        router.push(`${pathname}?${params.toString()}`);
    }

    const onCopy = () => {
        navigator.clipboard.writeText(`${fullUrl}?collab=${sharingKey}`)
        toast("Copied to clipboard", { position: "bottom-right", icon: <Check /> })
    }

    const onClose = () => {
        setSharingKey("")
        setIsOpen(false)
    }

    return (
        <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose() }}>
            <form onSubmit={onShare}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">Share diagrams <Badge variant="outline">Beta</Badge> </DialogTitle>
                        <DialogDescription>
                            Share the diagram and collab with other users.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4">
                        <div className="flex items-center gap-3">
                            <OctagonAlert />
                            <Label htmlFor="include-ai">Everyone with the link will be able to edit the diagrams</Label>
                        </div>

                        <p className="flex items-center gap-1 text-xs text-muted-foreground">
                            This feature is still in beta,
                            <span
                                role="link"
                                className="font-bold hover:text-lime-500 cursor-pointer flex items-center gap-1"
                                onClick={() => activateCommand("open-export-dialog")}>
                                export
                                <Download className="size-3" />
                                your work
                            </span>
                            before sharing.
                        </p>
                    </div>
                    <DialogFooter className="flex w-full items-center justify-between min-w-0">
                        {sharingKey &&
                            <div className="flex flex-1 items-center gap-2 text-sm min-w-0">
                                <span className="flex-1 truncate min-w-0">
                                    {fullUrl}?collab={sharingKey}
                                </span>
                                <Button variant="ghost" size="icon" className="flex-shrink-0" onClick={onCopy}>
                                    <Copy />
                                </Button>
                            </div>
                        }
                        <DialogClose asChild onClick={onClose}>
                            <Button variant="outline" type="button">
                                {sharingKey ? "Close" : "Cancel"}
                            </Button>
                        </DialogClose>
                        {!sharingKey &&
                            <Button type="submit" onClick={onShare} className="flex-shrink-0">
                                Share
                            </Button>
                        }
                    </DialogFooter>
                </DialogContent>
            </form>
        </Dialog>
    )
}

export default CollabDialog;
