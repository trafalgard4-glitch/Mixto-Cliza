import { useState } from "react";
import { buscarEncomienda } from "../firebase/rastreo";

const ESTADOS = {
  EN_OFICINA: {
    label: "En oficina",
    descripcion: "Tu encomienda está siendo procesada en la oficina.",
    bg: "#fef9c3", color: "#854d0e", border: "#fde047",
    icono: "📦", paso: 1,
  },
  EN_RUTA: {
    label: "En ruta",
    descripcion: "Tu encomienda está en camino al destino.",
    bg: "#dbeafe", color: "#1e40af", border: "#93c5fd",
    icono: "🚗", paso: 2,
  },
  ENTREGADO: {
    label: "Entregado",
    descripcion: "Tu encomienda fue entregada exitosamente.",
    bg: "#dcfce7", color: "#166534", border: "#86efac",
    icono: "✅", paso: 3,
  },
};

const PASOS = [
  { numero: 1, label: "En oficina", icono: "📦" },
  { numero: 2, label: "En ruta", icono: "🚗" },
  { numero: 3, label: "Entregado", icono: "✅" },
];

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
    if (resultado) setEncomienda(resultado);
    else setNoEncontrado(true);
    setBuscando(false);
  };

  const estado = encomienda ? ESTADOS[encomienda.estado] : null;

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#f3f4f6" }}>

      {/* Navbar */}
      <nav style={{ backgroundColor: "#157f3c", zIndex: 1001, position: "relative" }}>
        <div className="px-4 md:px-6 flex items-center h-16 gap-3">
          <img
            src="/images/LogoMC.png"
            alt="Mixto Cliza"
            className="w-20 h-20 object-contain flex-shrink-0 -my-2"
          />
          <div>
            <h1 className="text-white font-bold text-base leading-none">Mixto Cliza</h1>
            <p className="text-xs leading-none mt-0.5" style={{ color: "#a7f3d0" }}>
              Rastreo de encomiendas
            </p>
          </div>
        </div>
      </nav>

      <div className="max-w-lg mx-auto px-4 py-10">

        {/* Buscador */}
        <div
          className="rounded-2xl p-6 mb-6 shadow-sm"
          style={{ backgroundColor: "#ffffff", border: "1px solid #e5e7eb" }}
        >
          <div className="text-center mb-6">
            <p className="text-3xl mb-2">📦</p>
            <h2 className="text-lg font-bold" style={{ color: "#111827" }}>
              Rastrea tu encomienda
            </h2>
            <p className="text-sm mt-1" style={{ color: "#6b7280" }}>
              Ingresa el código que recibiste al momento del envío
            </p>
          </div>

          <div className="flex gap-2">
            <input
              value={codigo}
              onChange={(e) => setCodigo(e.target.value.toUpperCase())}
              onKeyDown={(e) => e.key === "Enter" && handleBuscar()}
              className="flex-1 px-4 py-3 rounded-xl text-sm font-mono outline-none transition"
              style={{
                backgroundColor: "#f3f4f6",
                border: "1.5px solid #e5e7eb",
                color: "#111827",
              }}
              onFocus={(e) => e.target.style.borderColor = "#157f3c"}
              onBlur={(e) => e.target.style.borderColor = "#e5e7eb"}
              placeholder="MC-20260517-XXXX"
            />
            <button
              onClick={handleBuscar}
              disabled={buscando}
              className="px-5 py-3 rounded-xl text-sm font-semibold text-white transition-all flex-shrink-0"
              style={{ backgroundColor: buscando ? "#86b89a" : "#157f3c" }}
            >
              {buscando ? "..." : "Buscar"}
            </button>
          </div>

          {noEncontrado && (
            <div
              className="mt-4 px-4 py-3 rounded-xl text-sm text-center"
              style={{ backgroundColor: "#fef2f2", color: "#dc2626", border: "1px solid #fecaca" }}
            >
              ⚠️ No se encontró ninguna encomienda con ese código
            </div>
          )}
        </div>

        {/* Resultado */}
        {encomienda && estado && (
          <div
            className="rounded-2xl shadow-sm overflow-hidden"
            style={{ backgroundColor: "#ffffff", border: "1px solid #e5e7eb" }}
          >
            {/* Banner estado */}
            <div
              className="px-6 py-4 flex items-center justify-between"
              style={{ backgroundColor: estado.bg, borderBottom: `1px solid ${estado.border}` }}
            >
              <div>
                <p className="text-xs font-medium mb-0.5" style={{ color: estado.color }}>
                  Estado actual
                </p>
                <p className="text-lg font-black" style={{ color: estado.color }}>
                  {estado.icono} {estado.label}
                </p>
              </div>
              <p
                className="font-mono text-xs font-bold px-3 py-1 rounded-full"
                style={{ backgroundColor: "rgba(255,255,255,0.6)", color: "#374151" }}
              >
                {encomienda.codigo}
              </p>
            </div>

            {/* Barra de progreso */}
            <div className="px-6 py-5">
              <div className="flex items-center">
                {PASOS.map((paso, i) => (
                  <div key={paso.numero} className="flex items-center flex-1 last:flex-none">
                    <div className="flex flex-col items-center">
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center text-base font-bold transition-all"
                        style={{
                          backgroundColor: estado.paso >= paso.numero ? "#157f3c" : "#f3f4f6",
                          color: estado.paso >= paso.numero ? "#ffffff" : "#9ca3af",
                          border: estado.paso === paso.numero ? "3px solid #52eba6" : "none",
                        }}
                      >
                        {estado.paso > paso.numero ? "✓" : paso.icono}
                      </div>
                      <p
                        className="text-xs mt-1.5 font-medium"
                        style={{ color: estado.paso >= paso.numero ? "#157f3c" : "#9ca3af" }}
                      >
                        {paso.label}
                      </p>
                    </div>
                    {i < PASOS.length - 1 && (
                      <div
                        className="flex-1 h-1 mx-2 mb-5 rounded-full transition-all"
                        style={{ backgroundColor: estado.paso > paso.numero ? "#157f3c" : "#e5e7eb" }}
                      />
                    )}
                  </div>
                ))}
              </div>

              <p
                className="text-sm text-center mt-4 font-medium"
                style={{ color: "#6b7280" }}
              >
                {estado.descripcion}
              </p>
            </div>

            {/* Detalles */}
            <div
              className="px-6 py-4 space-y-3"
              style={{ borderTop: "1px solid #f3f4f6" }}
            >
              {[
                { label: "De", valor: encomienda.remitente },
                { label: "Para", valor: encomienda.destinatario },
                { label: "Descripción", valor: encomienda.descripcion },
                {
                  label: "Precio",
                  valor: `Bs. ${encomienda.precio}`,
                  extra: encomienda.quienPaga === "destinatario" ? "· Paga al recibir" : "· Ya pagado"
                },
                encomienda.choferAsignado && {
                  label: "Chofer",
                  valor: `${encomienda.choferAsignado.nombre} — ${encomienda.choferAsignado.placa}`
                },
              ].filter(Boolean).map((item) => (
                <div key={item.label} className="flex justify-between items-start gap-4">
                  <span className="text-xs font-medium flex-shrink-0" style={{ color: "#9ca3af" }}>
                    {item.label}
                  </span>
                  <span className="text-sm font-semibold text-right" style={{ color: "#111827" }}>
                    {item.valor}
                    {item.extra && (
                      <span className="font-normal ml-1" style={{ color: "#6b7280" }}>
                        {item.extra}
                      </span>
                    )}
                  </span>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div
              className="px-6 py-3 text-center"
              style={{ backgroundColor: "#f9fafb", borderTop: "1px solid #f3f4f6" }}
            >
              <p className="text-xs" style={{ color: "#9ca3af" }}>
                🇧🇴 Asociación de Taxis Mixto Cliza · Cliza, Cochabamba
              </p>
            </div>
          </div>
        )}

        {/* Sin resultado aún */}
        {!encomienda && !noEncontrado && (
          <div className="text-center py-8">
            <p className="text-xs" style={{ color: "#9ca3af" }}>
              Ingresa tu código para ver el estado de tu encomienda
            </p>
          </div>
        )}
      </div>
    </div>
  );
}