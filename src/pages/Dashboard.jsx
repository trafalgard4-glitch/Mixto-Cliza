import { signOut } from "firebase/auth";
import { auth } from "../firebase/config";
import Encomiendas from "./Encomiendas";
import RadioTaxi from "./RadioTaxi";
import Administracion from "./Administracion";
import { useState } from "react";

const ROLES = {
  admin: { label: "Administrador", icono: "👔" },
  secretaria: { label: "Secretaria", icono: "💼" },
  chofer: { label: "Chofer", icono: "🚗" },
};

const MENU = {
  admin: [
    { id: "encomiendas", label: "Encomiendas", icono: "📦" },
    { id: "radio taxi", label: "Radio Taxi", icono: "🚕" },
    { id: "administración", label: "Administración", icono: "👥" },
  ],
  secretaria: [
    { id: "encomiendas", label: "Encomiendas", icono: "📦" },
    { id: "radio taxi", label: "Radio Taxi", icono: "🚕" },
  ],
  chofer: [
    { id: "mis viajes", label: "Mis Viajes", icono: "🗺️" },
  ],
};

export default function Dashboard({ usuario }) {
  const [seccion, setSeccion] = useState("encomiendas");
  const [menuMovil, setMenuMovil] = useState(false);
  const rol = ROLES[usuario.rol] || ROLES.chofer;
  const menu = MENU[usuario.rol] || MENU.chofer;

  const handleLogout = async () => {
    await signOut(auth);
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#f3f4f6" }}>

      {/* Navbar */}
      <nav
        className="shadow-sm sticky top-0"
        style={{ backgroundColor: "#157f3c", zIndex: 1001 }}
      >
        <div className="px-4 md:px-6 flex justify-between items-center h-16">

          {/* Logo + nombre */}
          <div className="flex items-center gap-3">
            <img
              src="/images/LogoMC.png"
              alt="Mixto Cliza"
              className="w-20 h-20 object-contain flex-shrink-0"
            />
            <div>
              <h1 className="text-white font-bold text-base leading-none">
                Mixto Cliza
              </h1>
              <p className="text-xs leading-none mt-0.5" style={{ color: "#a7f3d0" }}>
                Sistema de Gestión
              </p>
            </div>
          </div>

          {/* Menú escritorio */}
          <div className="hidden md:flex items-center gap-1">
            {menu.map((item) => (
              <button
                key={item.id}
                onClick={() => setSeccion(item.id)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all"
                style={{
                  backgroundColor: seccion === item.id
                    ? "rgba(255,255,255,0.2)"
                    : "transparent",
                  color: seccion === item.id ? "#ffffff" : "#bbf7d0",
                }}
                onMouseEnter={(e) => {
                  if (seccion !== item.id)
                    e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.1)";
                }}
                onMouseLeave={(e) => {
                  if (seccion !== item.id)
                    e.currentTarget.style.backgroundColor = "transparent";
                }}
              >
                <span>{item.icono}</span>
                {item.label}
              </button>
            ))}
          </div>

          {/* Usuario + logout */}
          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2">
              <span className="text-lg">{rol.icono}</span>
              <div className="text-right">
                <p className="text-white text-xs font-semibold leading-none">
                  {rol.label}
                </p>
                <p className="text-xs leading-none mt-0.5 truncate max-w-32"
                  style={{ color: "#a7f3d0" }}>
                  {usuario.email}
                </p>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-all"
              style={{
                backgroundColor: "rgba(255,255,255,0.15)",
                color: "#ffffff",
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "rgba(220,38,38,0.7)"}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.15)"}
            >
              Salir →
            </button>

            {/* Botón menú móvil */}
            <button
              onClick={() => setMenuMovil(!menuMovil)}
              className="md:hidden text-white text-xl"
            >
              {menuMovil ? "✕" : "☰"}
            </button>
          </div>
        </div>

        {/* Menú móvil desplegable */}
        {menuMovil && (
          <div
            className="md:hidden px-4 pb-3 border-t"
            style={{ borderColor: "rgba(255,255,255,0.15)" }}
          >
            {menu.map((item) => (
              <button
                key={item.id}
                onClick={() => { setSeccion(item.id); setMenuMovil(false); }}
                className="flex items-center gap-2 w-full px-3 py-2.5 rounded-xl text-sm font-medium mt-1"
                style={{
                  backgroundColor: seccion === item.id
                    ? "rgba(255,255,255,0.2)"
                    : "transparent",
                  color: "#ffffff",
                }}
              >
                <span>{item.icono}</span>
                {item.label}
              </button>
            ))}
          </div>
        )}
      </nav>

      {/* Breadcrumb */}
      <div
        className="px-4 md:px-6 py-2 flex items-center gap-2 text-xs border-b"
        style={{ backgroundColor: "#ffffff", borderColor: "#e5e7eb", color: "#6b7280" }}
      >
        <span style={{ color: "#157f3c" }}>Mixto Cliza</span>
        <span>›</span>
        <span style={{ color: "#111827", fontWeight: 500 }}>
          {menu.find(m => m.id === seccion)?.icono}{" "}
          {menu.find(m => m.id === seccion)?.label || seccion}
        </span>
      </div>

      {/* Contenido */}
      <main>
        {seccion === "encomiendas" && <Encomiendas />}
        {seccion === "radio taxi" && <RadioTaxi />}
        {seccion === "administración" && <Administracion />}
        {seccion === "mis viajes" && (
          <div className="p-6 text-gray-400">Módulo Mis Viajes — próximamente</div>
        )}
      </main>
    </div>
  );
}