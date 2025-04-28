"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  validateToken: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  // Cargar usuario del localStorage al inicio con manejo de errores mejorado
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('user');
      const token = localStorage.getItem('token');
      
      if (storedUser && token) {
        try {
          // Intentar parsear el JSON con una validación previa
          const parsedUser = JSON.parse(storedUser);
          
          // Verificar que el objeto tiene la estructura esperada
          if (parsedUser && typeof parsedUser === 'object' && 
              'id' in parsedUser && 'name' in parsedUser && 
              'email' in parsedUser && 'role' in parsedUser) {
            setUser(parsedUser);
          } else {
            // Si la estructura no es la esperada, limpiar localStorage
            console.warn('Estructura de usuario inválida en localStorage');
            localStorage.removeItem('user');
            localStorage.removeItem('token');
          }
        } catch (parseError) {
          // Si hay un error al parsear, limpiar localStorage
          console.error('Error al parsear datos de usuario:', parseError);
          localStorage.removeItem('user');
          localStorage.removeItem('token');
        }
      }
    } catch (error) {
      console.error('Error al acceder a localStorage:', error);
    } finally {
      setLoading(false);
      
      // Validar el token con el backend después de cargar desde localStorage
      const token = localStorage.getItem('token');
      if (token) {
        validateToken();
      }
    }
  }, []);

  // Validar token con el backend cada vez que cambia la ruta
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token && !loading) {
      validateToken();
    }
  }, [pathname]);

  const validateToken = async (): Promise<boolean> => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        handleLogout();
        return false;
      }

      // Usar el endpoint profile en lugar de validate
      const response = await fetch('http://localhost:5000/api/users/profile', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        handleLogout();
        return false;
      }

      const data = await response.json();
      
      // Actualizar el usuario con los datos del servidor
      if (data.user) {
        const userData = {
          id: data.user._id || data.user.id,
          name: data.user.name,
          email: data.user.email,
          role: data.user.role
        };
        
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
      }
      
      return true;
    } catch (error) {
      console.error('Error validando token:', error);
      handleLogout();
      return false;
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await fetch('http://localhost:5000/api/users/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al iniciar sesión');
      }

      // Asegurarse de que el objeto usuario tiene la estructura correcta antes de guardarlo
      const userData = {
        id: data.user._id || data.user.id,
        name: data.user.name,
        email: data.user.email,
        role: data.user.role
      };

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(userData));
      
      setUser(userData);
      return true;
    } catch (error) {
      console.error('Error al iniciar sesión:', error);
      return false;
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  const logout = () => {
    handleLogout();
    router.push('/');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, validateToken }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};