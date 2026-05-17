import { useState } from "react";
import { buscarEncomienda } from "../firebase/rastreo";

const ESTADOS = {
  EN_OFICINA: {
    label: "En oficina",
    descripcion: "Tu encomienda está siendo procesada en la oficina.",
    color: "bg-yellow-100 text-yellow-800",
    icono: "📦",
    paso: 1,
  },
  EN_RUTA: {
    label: "En ruta",
    descripcion: "Tu encomienda está en camino al destino.",
    color: "bg-blue-100 text-blue-800",
    icono: "🚗",
    paso: 2,
  },
  ENTREGADO: {
    label: "Entregado",
    descripcion: "Tu encomienda fue entregada exitosamente.",
    color: "bg-green-100 text-green-800",
    icono: "✅",
    paso: 3,
  },
};

export default function Rastreo() {
  const [codigo, setCodigo] = useState("");
  const [encomienda, setEncomienda] = useState(null);
  const [buscando, setBuscando] = useState(false);
  const [noEncontrado, setNoEncontrado] = useState(false);

  const handleBuscar = async () => {
    if (!codigo.trim()) return;
    setBuscando(true);
    setNoEncontrado(false);
    setEncomienda(null);
    const resultado = await buscarEncomienda(codigo);
    if (resultado) {
      setEncomienda(resultado);
    } else {
      setNoEncontrado(true);
    }
    setBuscando(false);
  };

  const estado = encomienda ? ESTADOS[encomienda.estado] : null;

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-white shadow px-6 py-4 flex items-center gap-3">
        <h1 className="text-xl font-bold text-gray-800">Mixto Cliza</h1>
        <span className="text-gray-400 text-sm">— Rastreo de encomiendas</span>
      </div>

      <div className="max-w-xl mx-auto mt-10 px-4">
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-1">
            Rastrea tu encomienda
          </h2>
          <p className="text-sm text-gray-400 mb-4">
            Ingresa el código que te dieron al momento del envío
          </p>

          <div className="flex gap-2">
            <input
              value={codigo}
              onChange={(e) => setCodigo(e.target.value.toUpperCase())}
              onKeyDown={(e) => e.key === "Enter" && handleBuscar()}
              className="flex-1 border rounded-lg px-4 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="MC-20260517-XXXX"
            />
            <button
              onClick={handleBuscar}
              disabled={buscando}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition disabled:opacity-50"
            >
              {buscando ? "Buscando..." : "Buscar"}
            </button>
          </div>

          {noEncontrado && (
            <p className="text-red-500 text-sm mt-3 text-center">
              No se encontró ninguna encomienda con ese código.
            </p>
          )}
        </div>

        {encomienda && estado && (
          <div className="bg-white rounded-xl shadow p-6 mt-4">
            <div className="flex items-center justify-between mb-4">
              <p className="font-mono text-blue-600 font-bold">{encomienda.codigo}</p>
              <span className={`text-xs px-3 py-1 rounded-full font-medium ${estado.color}`}>
                {estado.icono} {estado.label}
              </span>
            </div>

            <div className="flex items-center justify-between mb-6">
              {[1, 2, 3].map((paso) => (
                <div key={paso} className="flex-1 flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold
                    ${estado.paso >= paso
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 text-gray-400"}`}>
                    {paso}
                  </div>
                  {paso < 3 && (
                    <div className={`flex-1 h-1 mx-1 ${estado.paso > paso ? "bg-blue-600" : "bg-gray-200"}`} />
                  )}
                </div>
              ))}
            </div>

            <p className="text-sm text-gray-500 text-center mb-6">{estado.descripcion}</p>

            <div className="border-t pt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">De</span>
                <span className="font-medium">{encomienda.remitente}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Para</span>
                <span className="font-medium">{encomienda.destinatario}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Descripción</span>
                <span className="font-medium">{encomienda.descripcion}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Precio</span>
                <span className="font-medium">Bs. {encomienda.precio}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Paga</span>
                <span className="font-medium capitalize">{encomienda.quienPaga}</span>
              </div>
              {encomienda.choferAsignado && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Chofer</span>
                  <span className="font-medium">
                    {encomienda.choferAsignado.nombre} — {encomienda.choferAsignado.placa}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}