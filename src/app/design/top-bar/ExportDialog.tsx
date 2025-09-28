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
import { Input } from "@/components/ui/input"
import { useEffect, useState } from "react"
// import { exportWithOptions } from "./exportImport"
import { Label } from "@/components/ui/label"
import { useCommandStore } from "../commandStore"
import { exportWithOptions } from "./exportImport"


export function ExportDialog() {
    const [isOpen, setIsOpen] = useState<boolean>(false)
    const [includeAIKey, setIncludeAIKey] = useState<boolean>(false)
    const [encrypt, setEncrypt] = useState<boolean>(false)
    const [password, setPassword] = useState<string>("")
    const [submitting, setSubmitting] = useState<boolean>(false)
    const [error, setError] = useState<string>("")
    const removeCommand = useCommandStore((state) => state.removeCommand)
    const openExportDialogCommand = useCommandStore((state) => state.commandMap["open-export-dialog"])

    useEffect(() => {
        if (openExportDialogCommand.status === "pending") {
            setIsOpen(true)
            removeCommand("open-export-dialog")
        }
    }, [openExportDialogCommand])

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError("")
        try {
            setSubmitting(true)
            await exportWithOptions({
                diagramName: "",
                includeOpenAIKey: includeAIKey,
                encrypt,
                password: encrypt ? password : undefined,
            })
            setIsOpen(false)
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to export")
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={(open) => { if (!open) setIsOpen(false) }}>
            <form onSubmit={onSubmit}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Export snapshot</DialogTitle>
                        <DialogDescription>
                            Choose what to include and optionally encrypt the exported file.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4">
                        <div className="flex items-center gap-3">
                            <input id="include-ai" type="checkbox" checked={includeAIKey} onChange={(e) => setIncludeAIKey(e.target.checked)} />
                            <Label htmlFor="include-ai">Export OpenAI key</Label>
                        </div>
                        <div className="flex items-center gap-3 pt-2">
                            <input id="encrypt" type="checkbox" checked={encrypt} onChange={(e) => setEncrypt(e.target.checked)} />
                            <Label htmlFor="encrypt">Encrypt file</Label>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="password">Password</Label>
                            <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} disabled={!encrypt} placeholder={encrypt ? "Enter a strong password" : "Disabled unless encrypt is checked"} />
                            {encrypt && (
                                <p className="text-xs text-red-500">
                                    Warning: If you forget the password, the file cannot be recovered.
                                </p>
                            )}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            GitHub connection is stored as HttpOnly cookie and cannot be exported.
                        </p>
                        {error && <p className="text-sm text-red-500">{error}</p>}
                    </div>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button variant="outline" type="button" disabled={submitting}>Cancel</Button>
                        </DialogClose>
                        <Button type="submit" onClick={onSubmit} disabled={submitting || (encrypt && password.length === 0)}>
                            {submitting ? "Exporting…" : "Export"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </form>
        </Dialog>
    )
}

export default ExportDialog;
