import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase/config";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch {
      setError("Correo o contraseña incorrectos");
    }
    setLoading(false);
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ backgroundColor: "#f3f4f6" }}
    >
      {/* Fondo decorativo */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute -top-32 -left-32 w-96 h-96 rounded-full opacity-10"
          style={{ backgroundColor: "#157f3c" }}
        />
        <div
          className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full opacity-10"
          style={{ backgroundColor: "#52eba6" }}
        />
        <div
          className="absolute top-1/2 left-1/4 w-64 h-64 rounded-full opacity-5"
          style={{ backgroundColor: "#157f3c" }}
        />
      </div>

      <div className="relative w-full max-w-md">

        {/* Logo / Header */}
        <div className="text-center mb-8">
          <img
            src="/images/LogoMC.png"
            alt="Mixto Cliza"
            className="w-49 h-49 object-contain mb-2 mx-auto"
          />
          <h1
            className="text-2xl font-bold"
            style={{ color: "#111827" }}
          >
            Mixto Cliza
          </h1>
          <p className="text-sm mt-1" style={{ color: "#6b7280" }}>
            Asociación de Taxis · Sistema de Gestión
          </p>
        </div>

        {/* Card */}
        <div
          className="rounded-2xl shadow-xl p-8"
          style={{ backgroundColor: "#ffffff", border: "1px solid #e5e7eb" }}
        >
          <h2
            className="text-lg font-semibold mb-6"
            style={{ color: "#111827" }}
          >
            Iniciar sesión
          </h2>

          <form onSubmit={handleLogin} className="space-y-4">

            {/* Email */}
            <div>
              <label
                className="block text-sm font-medium mb-1.5"
                style={{ color: "#374151" }}
              >
                Correo electrónico
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                  ✉️
                </span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm outline-none transition"
                  style={{
                    backgroundColor: "#f3f4f6",
                    border: "1.5px solid #e5e7eb",
                    color: "#111827",
                  }}
                  onFocus={(e) => e.target.style.borderColor = "#157f3c"}
                  onBlur={(e) => e.target.style.borderColor = "#e5e7eb"}
                  placeholder="correo@ejemplo.com"
                  required
                />
              </div>
            </div>

            {/* Contraseña */}
            <div>
              <label
                className="block text-sm font-medium mb-1.5"
                style={{ color: "#374151" }}
              >
                Contraseña
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                  🔒
                </span>
                <input
                  type={showPass ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-10 py-2.5 rounded-xl text-sm outline-none transition"
                  style={{
                    backgroundColor: "#f3f4f6",
                    border: "1.5px solid #e5e7eb",
                    color: "#111827",
                  }}
                  onFocus={(e) => e.target.style.borderColor = "#157f3c"}
                  onBlur={(e) => e.target.style.borderColor = "#e5e7eb"}
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs"
                  style={{ color: "#6b7280" }}
                >
                  {showPass ? "Ocultar" : "Ver"}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div
                className="rounded-xl px-4 py-3 text-sm"
                style={{ backgroundColor: "#fef2f2", color: "#dc2626", border: "1px solid #fecaca" }}
              >
                ⚠️ {error}
              </div>
            )}

            {/* Botón */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl text-sm font-semibold text-white transition-all mt-2"
              style={{
                backgroundColor: loading ? "#86b89a" : "#157f3c",
                boxShadow: loading ? "none" : "0 4px 14px rgba(21,127,60,0.35)",
              }}
              onMouseEnter={(e) => { if (!loading) e.target.style.backgroundColor = "#0f5c2b"; }}
              onMouseLeave={(e) => { if (!loading) e.target.style.backgroundColor = "#157f3c"; }}
            >
              {loading ? "Ingresando..." : "Ingresar →"}
            </button>
          </form>
        </div>

        {/* Roles disponibles */}
        <div className="mt-6 grid grid-cols-3 gap-2">
          {[
            { rol: "Admin", icono: "👔", color: "#157f3c" },
            { rol: "Secretaria", icono: "💼", color: "#0f5c2b" },
            { rol: "Chofer", icono: "🚗", color: "#52eba6" },
          ].map((r) => (
            <div
              key={r.rol}
              className="rounded-xl p-2.5 text-center"
              style={{ backgroundColor: "#ffffff", border: "1px solid #e5e7eb" }}
            >
              <span className="text-lg">{r.icono}</span>
              <p className="text-xs font-medium mt-1" style={{ color: "#374151" }}>
                {r.rol}
              </p>
            </div>
          ))}
        </div>

        <p className="text-center text-xs mt-4" style={{ color: "#9ca3af" }}>
          Cliza — Cochabamba · Bolivia 🇧🇴
        </p>
      </div>
    </div>
  );
}