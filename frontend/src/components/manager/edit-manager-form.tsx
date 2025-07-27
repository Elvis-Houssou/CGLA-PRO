import { ManagerProps } from "@/props"

interface EditManagerFormProps {
  manager: ManagerProps | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onManagerUpdated?: (updatedManager: ManagerProps) => void
}

export default function EditManagerForm({ manager, open, onOpenChange, onManagerUpdated }: EditManagerFormProps) {
    return (
        <div></div>
    )
}