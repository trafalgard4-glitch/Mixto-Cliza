import { useState, useEffect } from "react";
import { registrarEncomienda, obtenerEncomiendas, actualizarEstado } from "../firebase/encomiendas";
import { obtenerChoferes } from "../firebase/choferes";
import { generarCodigoEncomienda } from "../utils/generarCodigo";

const ESTADOS = {
  EN_OFICINA: { label: "En oficina", bg: "#fef9c3", color: "#854d0e" },
  EN_RUTA: { label: "En ruta", bg: "#dbeafe", color: "#1e40af" },
  ENTREGADO: { label: "Entregado", bg: "#dcfce7", color: "#166534" },
};

export default function Encomiendas() {
  const [encomiendas, setEncomiendas] = useState([]);
  const [choferes, setChoferes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [form, setForm] = useState({
    remitente: "", telefonoRemitente: "",
    destinatario: "", telefonoDestinatario: "",
    descripcion: "", precio: "", quienPaga: "remitente",
  });

  useEffect(() => { cargarDatos(); }, []);

  const cargarDatos = async () => {
    setCargando(true);
    const [e, c] = await Promise.all([obtenerEncomiendas(), obtenerChoferes()]);
    setEncomiendas(e);
    setChoferes(c.filter((c) => c.estado === "DISPONIBLE"));
    setCargando(false);
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async () => {
    if (!form.remitente || !form.destinatario || !form.descripcion || !form.precio) {
      alert("Por favor completa todos los campos obligatorios");
      return;
    }
    setGuardando(true);
    const choferAsignado = choferes[0] || null;
    await registrarEncomienda({
      ...form,
      precio: Number(form.precio),
      codigo: generarCodigoEncomienda(),
      choferAsignado: choferAsignado
        ? { id: choferAsignado.id, nombre: choferAsignado.nombre, placa: choferAsignado.placa }
        : null,
    });
    setForm({
      remitente: "", telefonoRemitente: "",
      destinatario: "", telefonoDestinatario: "",
      descripcion: "", precio: "", quienPaga: "remitente",
    });
    setMostrarForm(false);
    setGuardando(false);
    cargarDatos();
  };

  const inputClass = "w-full px-3 py-2 rounded-xl text-sm outline-none transition";
  const inputStyle = {
    backgroundColor: "#f3f4f6",
    border: "1.5px solid #e5e7eb",
    color: "#111827",
  };

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto">

      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-bold" style={{ color: "#111827" }}>
            📦 Encomiendas
          </h2>
          <p className="text-xs mt-0.5" style={{ color: "#6b7280" }}>
            {encomiendas.length} encomiendas registradas
          </p>
        </div>
        <button
          onClick={() => setMostrarForm(!mostrarForm)}
          className="px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all"
          style={{ backgroundColor: mostrarForm ? "#6b7280" : "#157f3c" }}
        >
          {mostrarForm ? "✕ Cancelar" : "+ Nueva encomienda"}
        </button>
      </div>

      {/* Formulario */}
      {mostrarForm && (
        <div
          className="rounded-2xl p-6 mb-6 shadow-sm"
          style={{ backgroundColor: "#ffffff", border: "1px solid #e5e7eb" }}
        >
          <h3 className="font-semibold mb-4" style={{ color: "#111827" }}>
            Registrar encomienda
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { name: "remitente", label: "Remitente *", placeholder: "Nombre completo" },
              { name: "telefonoRemitente", label: "Teléfono remitente", placeholder: "7XXXXXXX" },
              { name: "destinatario", label: "Destinatario *", placeholder: "Nombre completo" },
              { name: "telefonoDestinatario", label: "Teléfono destinatario", placeholder: "7XXXXXXX" },
              { name: "descripcion", label: "Descripción *", placeholder: "Ej: Ropa, documentos..." },
              { name: "precio", label: "Precio (Bs.) *", placeholder: "0", type: "number" },
            ].map((field) => (
              <div key={field.name}>
                <label className="text-xs font-medium mb-1.5 block" style={{ color: "#374151" }}>
                  {field.label}
                </label>
                <input
                  name={field.name}
                  value={form[field.name]}
                  onChange={handleChange}
                  type={field.type || "text"}
                  placeholder={field.placeholder}
                  className={inputClass}
                  style={inputStyle}
                  onFocus={(e) => e.target.style.borderColor = "#157f3c"}
                  onBlur={(e) => e.target.style.borderColor = "#e5e7eb"}
                />
              </div>
            ))}

            <div>
              <label className="text-xs font-medium mb-1.5 block" style={{ color: "#374151" }}>
                ¿Quién paga?
              </label>
              <select
                name="quienPaga"
                value={form.quienPaga}
                onChange={handleChange}
                className={inputClass}
                style={inputStyle}
              >
                <option value="remitente">Remitente (paga al enviar)</option>
                <option value="destinatario">Destinatario (contra entrega)</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-medium mb-1.5 block" style={{ color: "#374151" }}>
                Chofer asignado
              </label>
              <div
                className="px-3 py-2 rounded-xl text-sm"
                style={{ backgroundColor: "#f0fdf4", border: "1.5px solid #86efac", color: "#166534" }}
              >
                {choferes[0]
                  ? `🚗 ${choferes[0].nombre} — ${choferes[0].placa}`
                  : "⚠️ Sin choferes disponibles"}
              </div>
            </div>
          </div>

          <button
            onClick={handleSubmit}
            disabled={guardando}
            className="mt-5 px-6 py-2.5 rounded-xl text-sm font-semibold text-white transition-all"
            style={{ backgroundColor: guardando ? "#86b89a" : "#157f3c" }}
          >
            {guardando ? "Guardando..." : "✓ Registrar encomienda"}
          </button>
        </div>
      )}

      {/* Lista */}
      {cargando ? (
        <div className="text-center py-12" style={{ color: "#9ca3af" }}>
          Cargando encomiendas...
        </div>
      ) : encomiendas.length === 0 ? (
        <div
          className="text-center py-16 rounded-2xl"
          style={{ backgroundColor: "#ffffff", border: "1px dashed #d1d5db" }}
        >
          <p className="text-4xl mb-3">📦</p>
          <p className="font-medium" style={{ color: "#374151" }}>Sin encomiendas aún</p>
          <p className="text-sm mt-1" style={{ color: "#9ca3af" }}>
            Registra la primera encomienda del día
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {encomiendas.map((enc) => (
            <div
              key={enc.id}
              className="rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 transition-all hover:shadow-md"
              style={{ backgroundColor: "#ffffff", border: "1px solid #e5e7eb" }}
            >
              <div className="flex items-start gap-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
                  style={{ backgroundColor: "#f0fdf4" }}
                >
                  📦
                </div>
                <div>
                  <p className="text-sm font-bold" style={{ color: "#157f3c" }}>
                    {enc.codigo}
                  </p>
                  <p className="text-sm font-medium mt-0.5" style={{ color: "#111827" }}>
                    {enc.remitente}
                    <span style={{ color: "#9ca3af" }}> → </span>
                    {enc.destinatario}
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: "#6b7280" }}>
                    {enc.descripcion}
                    {enc.choferAsignado && (
                      <span style={{ color: "#157f3c" }}>
                        {" · "} 🚗 {enc.choferAsignado.nombre}
                      </span>
                    )}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 flex-shrink-0">
                <span className="text-sm font-bold" style={{ color: "#111827" }}>
                  Bs. {enc.precio}
                </span>
                <span
                  className="text-xs px-2.5 py-1 rounded-full font-medium"
                  style={{
                    backgroundColor: ESTADOS[enc.estado]?.bg,
                    color: ESTADOS[enc.estado]?.color,
                  }}
                >
                  {ESTADOS[enc.estado]?.label}
                </span>
                {enc.estado !== "ENTREGADO" && (
                  <select
                    value={enc.estado}
                    onChange={async (e) => {
                      await actualizarEstado(enc.id, e.target.value, enc.choferAsignado?.id);
                      cargarDatos();
                    }}
                    className="text-xs px-2 py-1.5 rounded-xl outline-none"
                    style={{
                      border: "1.5px solid #e5e7eb",
                      color: "#374151",
                      backgroundColor: "#f9fafb",
                    }}
                  >
                    <option value="EN_OFICINA">En oficina</option>
                    <option value="EN_RUTA">En ruta</option>
                    <option value="ENTREGADO">Entregado</option>
                  </select>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}