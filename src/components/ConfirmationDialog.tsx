import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export const ConfirmationDialog = ({ open, onOpenChange, title, description, confirmLabel = "Confirm", onConfirm }: { open: boolean; onOpenChange: (open: boolean) => void; title: string; description: string; confirmLabel?: string; onConfirm: () => void }) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="rounded-xl border-[#DDE3E8] sm:max-w-md">
      <DialogHeader>
        <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-red-600"><AlertTriangle className="h-5 w-5" /></div>
        <DialogTitle className="text-[#16365D]">{title}</DialogTitle>
        <DialogDescription className="text-[#667085]">{description}</DialogDescription>
      </DialogHeader>
      <DialogFooter>
        <Button variant="outline" className="rounded-lg border-[#DDE3E8]" onClick={() => onOpenChange(false)}>Cancel</Button>
        <Button variant="destructive" className="rounded-lg" onClick={() => { onConfirm(); onOpenChange(false); }}>{confirmLabel}</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
);
