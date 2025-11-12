import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import "../styles/pdf-export-fix.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Plataforma Educativa AR",
  description: "Plataforma educativa con realidad aumentada para preescolar",
    generator: 'v0.app'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <head>
        <link rel="icon" type="image/png" href="/favicon.png" />
      </head>
      <body className={`${inter.className} min-h-screen bg-[var(--background)] text-[var(--foreground)]`}>
        <div className="flex min-h-screen flex-col bg-[var(--background)]">
          <main className="flex-1">{children}</main>
          {/* Espaciador para que el contenido no quede oculto tras el footer fijo */}
          <div className="h-24 bg-[var(--background)]" aria-hidden="true" />
        </div>
        <footer className="fixed bottom-0 left-0 right-0 py-4 text-center text-sm text-gray-500 border-t bg-white/95 backdrop-blur supports-[backdrop-filter]:backdrop-saturate-150">
          ©2025 Desarrollo - CN
        </footer>
      </body>
    </html>
  )
}
