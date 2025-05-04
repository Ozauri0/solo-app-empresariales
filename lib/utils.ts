import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

// Usamos rutas relativas para que funcione con nuestro proxy
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || '';

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
