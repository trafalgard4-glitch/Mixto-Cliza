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
  const [filtroFecha, setFiltroFecha] = useState("hoy");
  const [busqueda, setBusqueda] = useState("");
  const [modalConfirm, setModalConfirm] = useState(null);
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

const encomiendaFiltradas = encomiendas.filter((enc) => {
    // Filtro por búsqueda
    const q = busqueda.toLowerCase();
    const coincideBusqueda =
      !busqueda ||
      enc.codigo?.toLowerCase().includes(q) ||
      enc.remitente?.toLowerCase().includes(q) ||
      enc.destinatario?.toLowerCase().includes(q);

    // Filtro por fecha
    if (!enc.fechaRegistro) return coincideBusqueda;
    const fecha = enc.fechaRegistro.toDate ? enc.fechaRegistro.toDate() : new Date(enc.fechaRegistro);
    const hoy = new Date();
    const inicioHoy = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());
    const inicioSemana = new Date(inicioHoy);
    inicioSemana.setDate(inicioHoy.getDate() - hoy.getDay());
    const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);

    let coincideFecha = true;
    if (filtroFecha === "hoy") coincideFecha = fecha >= inicioHoy;
    else if (filtroFecha === "semana") coincideFecha = fecha >= inicioSemana;
    else if (filtroFecha === "mes") coincideFecha = fecha >= inicioMes;

    return coincideBusqueda && coincideFecha;
  });

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
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-xl font-bold" style={{ color: "#111827" }}>
            📦 Encomiendas
          </h2>
          <p className="text-xs mt-0.5" style={{ color: "#6b7280" }}>
            {encomiendaFiltradas.length} de {encomiendas.length} encomiendas
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

      {/* Filtros */}
      <div className="flex flex-col md:flex-row gap-3 mb-6">
        <input
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          placeholder="🔍 Buscar por código, remitente o destinatario..."
          className="flex-1 px-4 py-2.5 rounded-xl text-sm outline-none transition"
          style={{
            backgroundColor: "#ffffff",
            border: "1.5px solid #e5e7eb",
            color: "#111827",
          }}
          onFocus={(e) => e.target.style.borderColor = "#157f3c"}
          onBlur={(e) => e.target.style.borderColor = "#e5e7eb"}
        />
        <div className="flex gap-2">
          {[
            { id: "hoy", label: "Hoy" },
            { id: "semana", label: "Semana" },
            { id: "mes", label: "Mes" },
            { id: "todos", label: "Todos" },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setFiltroFecha(f.id)}
              className="px-3 py-2 rounded-xl text-xs font-semibold transition-all"
              style={{
                backgroundColor: filtroFecha === f.id ? "#157f3c" : "#ffffff",
                color: filtroFecha === f.id ? "#ffffff" : "#374151",
                border: filtroFecha === f.id ? "none" : "1px solid #e5e7eb",
              }}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Formulario */}
      {/* Resumen del día */}
      {filtroFecha === "hoy" && !mostrarForm && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {[
            {
              label: "Total hoy",
              valor: encomiendaFiltradas.length,
              bg: "#f0fdf4", color: "#157f3c", border: "#86efac",
              icono: "📦"
            },
            {
              label: "En oficina",
              valor: encomiendaFiltradas.filter(e => e.estado === "EN_OFICINA").length,
              bg: "#fef9c3", color: "#854d0e", border: "#fde047",
              icono: "🏠"
            },
            {
              label: "En ruta",
              valor: encomiendaFiltradas.filter(e => e.estado === "EN_RUTA").length,
              bg: "#dbeafe", color: "#1e40af", border: "#93c5fd",
              icono: "🚗"
            },
            {
              label: "Recaudado",
              valor: `Bs. ${encomiendaFiltradas
                .filter(e => e.quienPaga === "remitente")
                .reduce((acc, e) => acc + (e.precio || 0), 0)}`,
              bg: "#f5f3ff", color: "#7c3aed", border: "#c4b5fd",
              icono: "💰"
            },
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-2xl p-4 text-center"
              style={{ backgroundColor: stat.bg, border: `1px solid ${stat.border}` }}
            >
              <p className="text-xl mb-1">{stat.icono}</p>
              <p className="text-xl font-black" style={{ color: stat.color }}>
                {stat.valor}
              </p>
              <p className="text-xs mt-0.5" style={{ color: "#6b7280" }}>{stat.label}</p>
            </div>
          ))}
        </div>
      )}
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
      ) : encomiendaFiltradas.length === 0 ? (
        <div
          className="text-center py-16 rounded-2xl"
          style={{ backgroundColor: "#ffffff", border: "1px dashed #d1d5db" }}
        >
          <p className="text-4xl mb-3">📦</p>
          <p className="font-medium" style={{ color: "#374151" }}>
            {busqueda || filtroFecha !== "todos" ? "Sin resultados" : "Sin encomiendas aún"}
          </p>
          <p className="text-sm mt-1" style={{ color: "#9ca3af" }}>
            {busqueda ? `No hay resultados para "${busqueda}"` : 
             filtroFecha !== "todos" ? "No hay encomiendas en este período" :
             "Registra la primera encomienda del día"}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {encomiendaFiltradas.map((enc) => (
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
                    onChange={(e) => {
                      const nuevoEstado = e.target.value;
                      if (nuevoEstado === "ENTREGADO") {
                        setModalConfirm({ enc, nuevoEstado });
                      } else {
                        actualizarEstado(enc.id, nuevoEstado, enc.choferAsignado?.id)
                          .then(cargarDatos);
                      }
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
                {/* Modal confirmación entrega */}
      {modalConfirm && (
        <div
          className="fixed inset-0 flex items-center justify-center p-4"
          style={{ backgroundColor: "rgba(0,0,0,0.4)", zIndex: 9999 }}
        >
          <div
            className="rounded-3xl shadow-2xl w-full max-w-sm p-6"
            style={{ backgroundColor: "#ffffff" }}
          >
            <div className="text-center mb-5">
              <div
                className="w-16 h-16 rounded-2xl mx-auto flex items-center justify-center text-3xl mb-4"
                style={{ backgroundColor: "#f0fdf4" }}
              >
                ✅
              </div>
              <h3 className="text-lg font-bold" style={{ color: "#111827" }}>
                Confirmar entrega
              </h3>
              <p className="text-sm mt-2" style={{ color: "#6b7280" }}>
                ¿Estás seguro que la encomienda
              </p>
              <p
                className="font-mono font-bold text-sm mt-1"
                style={{ color: "#157f3c" }}
              >
                {modalConfirm.enc.codigo}
              </p>
              <p className="text-sm mt-1" style={{ color: "#6b7280" }}>
                fue entregada a{" "}
                <span className="font-semibold" style={{ color: "#111827" }}>
                  {modalConfirm.enc.destinatario}
                </span>
                ?
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setModalConfirm(null)}
                className="py-3 rounded-2xl text-sm font-semibold transition-all"
                style={{
                  backgroundColor: "#f3f4f6",
                  color: "#374151",
                  border: "1px solid #e5e7eb",
                }}
              >
                Cancelar
              </button>
              <button
                onClick={async () => {
                  await actualizarEstado(
                    modalConfirm.enc.id,
                    modalConfirm.nuevoEstado,
                    modalConfirm.enc.choferAsignado?.id
                  );
                  setModalConfirm(null);
                  cargarDatos();
                }}
                className="py-3 rounded-2xl text-sm font-semibold text-white transition-all"
                style={{ backgroundColor: "#157f3c" }}
              >
                ✅ Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}