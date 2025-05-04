"use client"

import { useEffect, useState } from "react";
import { toast } from "sonner";
import ProtectedRoute from "@/components/protected-route";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CourseCard } from "@/components/ui/course-card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

interface Course {
  _id: string;
  title: string;
  code: string;
  description: string;
  image?: string;
  instructor: {
    _id: string;
    name: string;
    email: string;
    username: string;
  };
  students: string[];
  startDate: string;
  endDate: string;
}

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [semester, setSemester] = useState("current");
  const [status, setStatus] = useState("active");
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    fetchCourses();
    
    // Obtener el rol del usuario desde localStorage
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const userData = JSON.parse(storedUser);
      setUserRole(userData.role);
    }
  }, []);

  useEffect(() => {
    // Filtrar cursos basados en los criterios de búsqueda
    let result = [...courses];
    
    // Filtrar por término de búsqueda
    if (searchTerm) {
      result = result.filter(course => 
        course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.code.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Filtrar por semestre (esto es un ejemplo, necesitarías lógica para determinar el semestre actual)
    // En un caso real, probablemente querrías filtrar por fecha de inicio/fin
    if (semester !== 'all') {
      // Implementar lógica de filtrado por semestre
    }
    
    // Filtrar por estado (aquí solo como ejemplo, necesitarías datos reales de estado)
    if (status !== 'all') {
      // Implementar lógica de filtrado por estado
    }
    
    setFilteredCourses(result);
  }, [courses, searchTerm, semester, status]);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        toast.error('Error de autenticación', {
          description: 'Por favor, inicia sesión de nuevo'
        });
        return;
      }
      
      const response = await fetch(`${API_BASE_URL}/api/courses`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      
      if (data.success) {
        setCourses(data.courses);
        setFilteredCourses(data.courses);
      } else {
        toast.error('Error', {
          description: data.message || 'Error al cargar los cursos'
        });
      }
    } catch (error) {
      toast.error('Error de conexión', {
        description: 'No se pudo conectar con el servidor'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const renderTitle = () => {
    if (userRole === 'student') return "Mis Cursos";
    if (userRole === 'teacher') return "Cursos que Imparto";
    if (userRole === 'admin') return "Todos los Cursos";
    return "Cursos";
  };

  const renderDescription = () => {
    if (userRole === 'student') return "Cursos en los que estás inscrito actualmente";
    if (userRole === 'teacher') return "Cursos que estás impartiendo este semestre";
    if (userRole === 'admin') return "Administración de todos los cursos disponibles";
    return "Explora los cursos disponibles";
  };

  return (
    <ProtectedRoute>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">{renderTitle()}</h1>

        <Card>
          <CardHeader>
            <CardTitle>Filtrar Cursos</CardTitle>
            <CardDescription>{renderDescription()}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="search">Buscar</Label>
                <Input 
                  id="search" 
                  placeholder="Nombre del curso o código" 
                  value={searchTerm}
                  onChange={handleSearchChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="semester">Semestre</Label>
                <Select defaultValue={semester} onValueChange={setSemester}>
                  <SelectTrigger id="semester">
                    <SelectValue placeholder="Seleccionar semestre" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="current">Semestre Actual</SelectItem>
                    <SelectItem value="previous">Semestre Anterior</SelectItem>
                    <SelectItem value="all">Todos los Semestres</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Estado</Label>
                <Select defaultValue={status} onValueChange={setStatus}>
                  <SelectTrigger id="status">
                    <SelectValue placeholder="Seleccionar estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Activos</SelectItem>
                    <SelectItem value="completed">Completados</SelectItem>
                    <SelectItem value="all">Todos</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-slate-800 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-lg font-medium">Cargando cursos...</p>
            </div>
          </div>
        ) : filteredCourses.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredCourses.map((course) => (
              <CourseCard 
                key={course._id} 
                course={{
                  id: course._id,
                  code: course.code,
                  name: course.title,
                  instructor: course.instructor?.name || 'Sin instructor asignado',
                  image: course.image || "/placeholder.svg?height=200&width=400"
                }} 
              />
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-center h-64 border rounded-lg">
            <div className="text-center">
              <p className="text-lg font-medium text-gray-500">No se encontraron cursos</p>
              <p className="text-sm text-gray-400">Intenta cambiar los filtros de búsqueda</p>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  )
}
