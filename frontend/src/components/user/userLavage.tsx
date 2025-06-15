import { useState } from "react";
import { toast } from "react-toastify";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose
} from "@/components/ui/dialog";
import { Bubbles } from "lucide-react";

export default function UserLavage() {
    const [open, setOpen] = useState(false);
    
    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="animated" className="w-full items-center justify-end rounded-lg text-sm hover:bg-green-300 hover:text-white">
                    Mes lavages
                    <Bubbles />
                </Button>
            </DialogTrigger>
        </Dialog>
    );
}