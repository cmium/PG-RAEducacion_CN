import LoginForm from "@/components/login-form"

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-400 via-teal-500 to-blue-500 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative circles */}
      <div className="absolute top-20 left-20 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
      <div className="absolute bottom-32 right-32 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
      <div className="absolute bottom-20 left-1/4 w-48 h-48 bg-white/10 rounded-full blur-3xl" />

      <LoginForm />
    </div>
  )
}
