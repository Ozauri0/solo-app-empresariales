import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

// Actualizada la URL base de la API para usar el puerto 5005
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5005';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date): string {
  // Opciones para formatear la fecha
  const options: Intl.DateTimeFormatOptions = {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }
  
  // Formatear fecha para español
  return new Intl.DateTimeFormat('es-ES', options).format(date)
}
