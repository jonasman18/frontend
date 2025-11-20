// src/components/LoginPage.tsx (mis à jour pour utiliser le service correctement)
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Lock, Mail, LogIn } from "lucide-react";
import AuthService from "../services/ApiService"; // Import du singleton
import { useAuth } from "../context/AuthContext";
import { type User } from "../models/User"; // Import explicite pour typage

const LoginPage: React.FC = () => {
  const { user, login, isLoading } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [formLoading, setFormLoading] = useState(false);

  // Redirect si déjà connecté (après chargement)
  useEffect(() => {
    if (!isLoading && user) {
      navigate("/examens", { replace: true });
    }
  }, [user, isLoading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setFormLoading(true);
    try {
      // Service retourne directement Promise<User> → typage parfait
      const userData: User = await AuthService.login({ email, password });
      login(userData); // Match exact avec User
      navigate("/examens", { replace: true });
    } catch (err: any) {
      console.error("Erreur login:", err);
      setError("❌ Email ou mot de passe incorrect");
    } finally {
      setFormLoading(false);
    }
  };

  // Si loading global, affiche spinner
  if (isLoading) {
    return (
      <div className="h-screen bg-emerald-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-emerald-400">
          <div className="w-8 h-8 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin"></div>
          <p>Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-emerald-950 flex items-center justify-center relative overflow-hidden">
      {/* Effet d’arrière-plan animé */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-emerald-800 via-emerald-900 to-black opacity-60"
        animate={{ opacity: [0.6, 0.7, 0.6] }}
        transition={{ duration: 6, repeat: Infinity }}
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="z-10 bg-emerald-950/80 backdrop-blur-md p-8 rounded-2xl shadow-lg border border-emerald-800 w-[380px]"
      >
        <div className="flex flex-col items-center mb-6">
          <Lock className="w-10 h-10 text-emerald-400 mb-2" />
          <h2 className="text-2xl font-bold text-emerald-300">Connexion</h2>
          <p className="text-sm text-emerald-400 mt-1">Accès au tableau de bord</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="text-sm text-emerald-400 flex items-center gap-2 mb-1">
              <Mail className="w-4 h-4" /> Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={formLoading}
              className="w-full px-3 py-2 rounded-md bg-emerald-900 text-white border border-emerald-700 focus:ring-2 focus:ring-emerald-500 outline-none disabled:opacity-50"
            />
          </div>

          <div>
            <label className="text-sm text-emerald-400 flex items-center gap-2 mb-1">
              <Lock className="w-4 h-4" /> Mot de passe
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={formLoading}
              className="w-full px-3 py-2 rounded-md bg-emerald-900 text-white border border-emerald-700 focus:ring-2 focus:ring-emerald-500 outline-none disabled:opacity-50"
            />
          </div>

          {error && <p className="text-red-400 text-sm text-center">{error}</p>}

          <motion.button
            whileTap={{ scale: 0.95 }}
            disabled={formLoading}
            type="submit"
            className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 py-2 rounded-md font-semibold mt-2 disabled:opacity-50"
          >
            <LogIn className="w-4 h-4" />
            {formLoading ? "Connexion..." : "Se connecter"}
          </motion.button>
        </form>

        <p className="text-xs text-center text-emerald-400/70 mt-5">
          © 2025 - Gestion des Examens
        </p>
      </motion.div>
    </div>
  );
};

export default LoginPage;