import { signOut } from "firebase/auth";
import { auth } from "../firebase/config";

export default function Dashboard({ usuario }) {
  const handleLogout = async () => {
    await signOut(auth);
  };

  const roles = {
    admin: { label: "Administrador", color: "bg-purple-100 text-purple-800" },
    secretaria: { label: "Secretaria", color: "bg-blue-100 text-blue-800" },
    chofer: { label: "Chofer", color: "bg-green-100 text-green-800" },
  };

  const rol = roles[usuario.rol] || roles.chofer;

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow px-6 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-gray-800">Mixto Cliza</h1>
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

      <main className="p-6">
        <h2 className="text-lg text-gray-700">
          Bienvenido, <span className="font-semibold">{usuario.email}</span>
        </h2>
        <p className="text-gray-400 text-sm mt-1">
          Los módulos aparecerán aquí
        </p>
      </main>
    </div>
  );
}