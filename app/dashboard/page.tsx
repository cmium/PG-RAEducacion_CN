import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import AdminDashboard from "@/components/admin-dashboard"
import StudentDashboard from "@/components/student-dashboard"

async function getSession() {
  const cookieStore = await cookies()
  const sessionCookie = cookieStore.get("session")

  if (!sessionCookie) {
    return null
  }

  return JSON.parse(sessionCookie.value)
}

export default async function DashboardPage() {
  const session = await getSession()

  if (!session) {
    redirect("/login")
  }

  // Redirigir según el rol
  if (session.id_rol === 1) {
    return <AdminDashboard user={session} />
  } else {
    return <StudentDashboard user={session} />
  }
}
