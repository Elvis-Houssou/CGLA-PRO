
"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "../../context/AuthContext"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { motion } from "framer-motion"

export default function Dashboard() {
  const { user, isLoading, isAuthenticated } = useAuth()
  const router = useRouter()

  // Rediriger vers la page d'accueil si non authentifié
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/")
    }
  }, [isAuthenticated, isLoading, router])

  // Déterminer où rediriger l'utilisateur en fonction de son rôle
  // useEffect(() => {
  //   if (user) {
  //     if (["super_admin", "manager"].includes(user.role)) {
  //       router.push("/dashboard/admin/users")
  //     } else if (user.role === "admin_garage") {
  //       router.push("/dashboard/admin/garage")
  //     } else {
  //       router.push("/dashboard/user/profile")
  //     }
  //   }
  // }, [user, router])

  if (isLoading) {
    return <div className="flex h-screen items-center justify-center">Chargement...</div>
  }

  if (!user) {
    return null // Redirection en cours
  }

  return (
    <div className="container mx-auto p-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <Card>
          <CardHeader>
            <CardTitle>
              Bienvenue, {user.firstname} {user.lastname}
            </CardTitle>
            <CardDescription>Vous êtes connecté en tant que {user.role}</CardDescription>
          </CardHeader>
          {/* <CardContent>
            <p>Redirection en cours vers votre espace...</p>
          </CardContent> */}
        </Card>
      </motion.div>
    </div>
  )
}

