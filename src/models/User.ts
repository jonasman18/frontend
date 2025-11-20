// src/types/User.ts
export interface User {
  id: string;
  email: string;
  displayName: string;
  role: 'admin' | 'user'; // Rôles possibles, extensible si besoin
  createdAt: Date; // Ou string si sérialisé depuis JSON
}