"use client"

import { useState, useEffect } from "react"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Settings, LayoutGrid, List } from "lucide-react"

function ModulesManagement() {
  const { toast } = useToast();
  const [students, setStudents] = useState<any[]>([])
  const [modules, setModules] = useState<any[]>([])
  const [selectedStudent, setSelectedStudent] = useState<any>(null)
  const [studentModules, setStudentModules] = useState<number[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [view, setView] = useState<'gallery' | 'list'>('gallery')

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const usersRes = await fetch("/api/admin/users")
      const usersData = await usersRes.json()
      setStudents(usersData.users.filter((u: any) => u.id_rol === 2))

      const modulesRes = await fetch("/api/admin/modules")
      const modulesData = await modulesRes.json()
      setModules(modulesData.modules)
    } catch (error) {
      console.error('Error loading data:', error)
    }
  }

  const openAssignDialog = async (student: any) => {
    try {
      setIsLoading(true)
      setSelectedStudent(student)
      setStudentModules([]) // Reset modules while loading

      // Cargar módulos asignados al estudiante
      const res = await fetch(`/api/admin/student-modules?userId=${student.id_usuario}`)
      const data = await res.json()
      
      if (Array.isArray(data.moduleIds)) {
        setStudentModules(data.moduleIds)
      } else {
        setStudentModules([])
      }
      
      setIsDialogOpen(true)
    } catch (error) {
      console.error('Error loading student modules:', error)
      setStudentModules([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleToggleModule = (moduleId: number) => {
    if (studentModules.includes(moduleId)) {
      setStudentModules(studentModules.filter((id) => id !== moduleId))
    } else {
      setStudentModules([...studentModules, moduleId])
    }
  }

  const handleSaveAssignment = async () => {
    try {
      const response = await fetch("/api/admin/student-modules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: selectedStudent.id_usuario,
          moduleIds: studentModules || [],
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save modules');
      }

      // Recargar los datos después de guardar
      await loadData();
      
      setIsDialogOpen(false);
      setSelectedStudent(null);

      // Notificación toast personalizada
      toast({
        title: '¡Asignación exitosa!',
        description: `Los módulos fueron asignados correctamente a ${selectedStudent?.nombre} ${selectedStudent?.apellido}.`,
      });

    } catch (error) {
      console.error('Error saving modules:', error);

      toast({
        title: 'Error al asignar módulos',
        description: (error as Error).message,
        variant: 'destructive',
      });
    }
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Asignación de Módulos</h2>
          <p className="text-gray-600 text-sm">Gestiona qué módulos puede ver cada estudiante</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={view === 'gallery' ? 'default' : 'outline'}
            size="icon"
            aria-label="Vista de galería"
            onClick={() => setView('gallery')}
          >
            <LayoutGrid className="w-5 h-5" />
          </Button>
          <Button
            variant={view === 'list' ? 'default' : 'outline'}
            size="icon"
            aria-label="Vista de lista"
            onClick={() => setView('list')}
          >
            <List className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {view === 'gallery' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {students.map((student) => (
            <Card key={student.id_usuario} className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                  {student.nombre[0]}
                  {student.apellido[0]}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">
                    {student.nombre} {student.apellido}
                  </h3>
                  <p className="text-sm text-gray-600">{student.nombre_usuario}</p>
                </div>
              </div>
              <Button
                className="w-full mt-4 gap-2 bg-transparent"
                variant="outline"
                onClick={() => openAssignDialog(student)}
              >
                <Settings className="w-4 h-4" />
                Asignar Módulos
              </Button>
            </Card>
          ))}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200 rounded-lg">
            <thead>
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Nombre</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Usuario</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student) => (
                <tr key={student.id_usuario} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-2">{student.nombre} {student.apellido}</td>
                  <td className="px-4 py-2">{student.nombre_usuario}</td>
                  <td className="px-4 py-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openAssignDialog(student)}
                      className="gap-2"
                    >
                      <Settings className="w-4 h-4" />
                      Asignar Módulos
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              Asignar Módulos a {selectedStudent?.nombre} {selectedStudent?.apellido}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            {isLoading ? (
              <div className="text-center p-4">Cargando módulos...</div>
            ) : (
              modules.map((module) => (
                <label
                  key={module.id_modulo}
                  className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50"
                >
                  <input
                    type="checkbox"
                    checked={Array.isArray(studentModules) && studentModules.includes(module.id_modulo)}
                    onChange={() => handleToggleModule(module.id_modulo)}
                    className="w-5 h-5 rounded border-gray-300"
                  />
                  <div>
                    <div className="font-medium text-gray-900">{module.nombre_modulo}</div>
                    <div className="text-sm text-gray-600">{module.descripcion}</div>
                  </div>
                </label>
              ))
            )}
          </div>
          <div className="flex gap-2 justify-end mt-4">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveAssignment}>Guardar Asignación</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default ModulesManagement
