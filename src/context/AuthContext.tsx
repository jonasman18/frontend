// src/context/AuthContext.tsx (mis à jour avec état de chargement et gestion des Dates)
import React, { createContext, useContext, useState, type ReactNode, useEffect } from 'react';
import type { User } from '../models/User';

interface AuthContextType {
  user: User | null;
  login: (user: User) => void;
  logout: () => void;
  isAdmin: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const login = (userData: User) => {
    setUser(userData);
    // Stockage en localStorage : JSON.stringify gère automatiquement Date → string ISO
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  const isAdmin = user?.role === 'admin';

  // Chargement depuis localStorage au montage
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const parsed: any = JSON.parse(storedUser);
        // Conversion createdAt string → Date si nécessaire (du backend ou stockage)
        if (parsed.createdAt && typeof parsed.createdAt === 'string') {
          parsed.createdAt = new Date(parsed.createdAt);
        }
        // Vérif basique que ça matche User (optionnel, pour robustesse)
        if (parsed.id && parsed.email && parsed.role) {
          setUser(parsed as User);
        } else {
          throw new Error('Données utilisateur invalides');
        }
      } catch (e) {
        console.error('Échec du parsing de l\'utilisateur stocké:', e);
        localStorage.removeItem('user'); // Nettoyage si corrompu
      }
    }
    setIsLoading(false); // Fin du chargement, même si pas d'utilisateur
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout, isAdmin, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};