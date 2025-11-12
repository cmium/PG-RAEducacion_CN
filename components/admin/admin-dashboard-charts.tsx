import { Bar, Pie } from "react-chartjs-2"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js"

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend)

export function AdminDashboardCharts({ stats }: { stats: any }) {
  // Ejemplo de datos
  const usersByRole = {
    labels: ["Administradores", "Estudiantes"],
    datasets: [
      {
        label: "Usuarios",
        data: [stats.admins, stats.students],
        backgroundColor: ["#a78bfa", "#38bdf8"],
      },
    ],
  }
  const passwordRequests = {
    labels: ["Pendientes", "Aprobadas", "Rechazadas"],
    datasets: [
      {
        label: "Solicitudes",
        data: [stats.pending, stats.approved, stats.rejected],
        backgroundColor: ["#fbbf24", "#22c55e", "#ef4444"],
      },
    ],
  }
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
      <div className="bg-white rounded-xl shadow p-6">
        <h3 className="font-semibold mb-4">Usuarios por rol</h3>
        <Pie data={usersByRole} />
      </div>
      <div className="bg-white rounded-xl shadow p-6">
        <h3 className="font-semibold mb-4">Solicitudes de cambio de contraseña</h3>
        <Bar data={passwordRequests} />
      </div>
    </div>
  )
}
