// import User from "@/api/User"
// import { ManagerProps } from "@/props"
// import { toast } from "sonner"

// interface EditManagerFormProps {
//   manager: ManagerProps | null
//   open: boolean
//   onOpenChange: (open: boolean) => void
//   onManagerUpdated?: (updatedManager: ManagerProps) => void
// }

// export default function EditManagerForm({ manager, open, onOpenChange, onManagerUpdated }: EditManagerFormProps) {
//     const assignQuota = async (managerId: number, quota: number) => {
//     try {
//       const response = await User.assignQuota(managerId, quota);
//       if (response.status === 200) {
//         toast.success("Quota assigné avec succès.");
//         setManagers((prev) =>
//           prev.map((m) =>
//             m.manager.id === managerId
//               ? { ...m, quota: { ...m.quota, quota: quota } }
//               : m
//           )
//         );
//       }
//     } catch (error: any) {
//       toast.error(error.message || "Erreur lors de la mise à jour du quota.");
//       console.error("Erreur lors de la mise à jour du quota:", error);
//     }
//   };
//     return (
//         <div></div>
//     )
// }