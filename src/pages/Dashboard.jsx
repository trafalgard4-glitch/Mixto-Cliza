import { signOut } from "firebase/auth";
import { auth } from "../firebase/config";
import Encomiendas from "./Encomiendas";
import RadioTaxi from "./RadioTaxi";
import { useState } from "react";

const ROLES = {
  admin: { label: "Administrador", color: "bg-purple-100 text-purple-800" },
  secretaria: { label: "Secretaria", color: "bg-blue-100 text-blue-800" },
  chofer: { label: "Chofer", color: "bg-green-100 text-green-800" },
};

const MENU = {
  admin: ["encomiendas", "radio taxi", "administración"],
  secretaria: ["encomiendas", "radio taxi"],
  chofer: ["mis viajes"],
};

export default function Dashboard({ usuario }) {
  const [seccion, setSeccion] = useState("encomiendas");
  const rol = ROLES[usuario.rol] || ROLES.chofer;
  const menu = MENU[usuario.rol] || MENU.chofer;

  const handleLogout = async () => {
    await signOut(auth);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-6">
          <h1 className="text-xl font-bold text-gray-800">Mixto Cliza</h1>
          <div className="hidden md:flex gap-2">
            {menu.map((item) => (
              <button
                key={item}
                onClick={() => setSeccion(item)}
                className={`text-sm px-3 py-1 rounded-lg capitalize transition ${
                  seccion === item
                    ? "bg-blue-600 text-white"
                    : "text-gray-500 hover:bg-gray-100"
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span className={`text-xs font-medium px-3 py-1 rounded-full ${rol.color}`}>
            {rol.label}
          </span>
          <button
            onClick={handleLogout}
            className="text-sm text-gray-500 hover:text-red-500 transition"
          >
            Cerrar sesión
          </button>
        </div>
      </nav>

      <main>
        {seccion === "encomiendas" && <Encomiendas />}
        {seccion === "radio taxi" && <RadioTaxi />}
        {seccion === "administración" && (
          <div className="p-6 text-gray-400">Módulo Administración — próximamente</div>
        )}
      </main>
    </div>
  );
}