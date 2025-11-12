import { NextResponse } from "next/server"

const mockModules = [
  {
    id_modulo: 1,
    nombre_modulo: "Aprender Colores",
    descripcion: "Módulo para aprender colores con AR",
    imagen_url: "/images/colors.png",
    qr_code_url: "/qr/colors.png",
    fecha_creacion: "2024-01-01",
  },
  {
    id_modulo: 2,
    nombre_modulo: "Aprender Formas",
    descripcion: "Módulo para aprender formas geométricas",
    imagen_url: "/images/shapes.png",
    qr_code_url: "/qr/shapes.png",
    fecha_creacion: "2024-01-01",
  },
  {
    id_modulo: 3,
    nombre_modulo: "Aprender Animales",
    descripcion: "Módulo para conocer animales",
    imagen_url: "/images/animals.png",
    qr_code_url: "/qr/animals.png",
    fecha_creacion: "2024-01-01",
  },
]

export async function GET() {
  return NextResponse.json({ modules: mockModules })
}
