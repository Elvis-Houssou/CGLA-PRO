import { ManagerProps } from "@/props"

interface ManagerDetailsModalProps {
  manager: ManagerProps | null
  open: boolean
  onOpenChange: (open: boolean) => void
}
export default function ManagerDetailsModal({ manager, open, onOpenChange }: ManagerDetailsModalProps) {
    return (
        <div></div>
    )
}