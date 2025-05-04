import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Variable global para URL base de la API
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || '';

// Variable para el año actual
export const currentYear = new Date().getFullYear();

// Función para formatear fechas
export const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
};

/**
 * Función centralizada para generar URLs de archivos
 * @param filePath - Ruta del archivo (puede ser relativa o absoluta)
 * @param type - Tipo de archivo ('course-material', 'course-image', 'news-image', etc.)
 * @returns URL completa para acceder al archivo
 */
export function getFileUrl(filePath?: string, type?: string): string {
  // Si no hay ruta, devolver placeholder según tipo
  if (!filePath) {
    if (type === 'course-image') return '/placeholder.svg?height=300&width=1000';
    if (type === 'news-image') return '/placeholder.svg?height=200&width=400';
    return '';
  }

  // Si la ruta ya es una URL completa, devolverla tal cual
  if (filePath.startsWith('http')) {
    return filePath;
  }

  // Para rutas absolutas (comienzan con /), añadir prefijo API_BASE_URL si está definido
  if (filePath.startsWith('/')) {
    // En desarrollo (API_BASE_URL definido), añadirlo como prefijo
    if (API_BASE_URL) {
      return `${API_BASE_URL}${filePath}`;
    }
    // En producción (API_BASE_URL vacío), usar ruta absoluta
    return filePath;
  }

  // Si la ruta no comienza con / ni http, asegurarnos de que tenga el formato correcto
  if (!filePath.startsWith('/uploads/')) {
    return `/uploads/${filePath}`;
  }

  return filePath;
}
