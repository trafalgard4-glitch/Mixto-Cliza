import { useState, useEffect } from "react";
import { registrarEncomienda, obtenerEncomiendas, actualizarEstado } from "../firebase/encomiendas";
import { obtenerChoferes } from "../firebase/choferes";
import { generarCodigoEncomienda } from "../utils/generarCodigo";

const ESTADOS = {
  EN_OFICINA: { label: "En oficina", color: "bg-yellow-100 text-yellow-800" },
  EN_RUTA: { label: "En ruta", color: "bg-blue-100 text-blue-800" },
  ENTREGADO: { label: "Entregado", color: "bg-green-100 text-green-800" },
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

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    setCargando(true);
    const [e, c] = await Promise.all([obtenerEncomiendas(), obtenerChoferes()]);
    setEncomiendas(e);
    setChoferes(c.filter((c) => c.estado === "DISPONIBLE"));
    setCargando(false);
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

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

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-800">Encomiendas</h2>
        <button
          onClick={() => setMostrarForm(!mostrarForm)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition"
        >
          {mostrarForm ? "Cancelar" : "+ Nueva encomienda"}
        </button>
      </div>

      {mostrarForm && (
        <div className="bg-white rounded-xl shadow p-6 mb-6">
          <h3 className="font-semibold text-gray-700 mb-4">Registrar encomienda</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-600">Remitente *</label>
              <input name="remitente" value={form.remitente} onChange={handleChange}
                className="w-full border rounded-lg px-3 py-2 mt-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                placeholder="Nombre completo" />
            </div>
            <div>
              <label className="text-sm text-gray-600">Teléfono remitente</label>
              <input name="telefonoRemitente" value={form.telefonoRemitente} onChange={handleChange}
                className="w-full border rounded-lg px-3 py-2 mt-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                placeholder="7XXXXXXX" />
            </div>
            <div>
              <label className="text-sm text-gray-600">Destinatario *</label>
              <input name="destinatario" value={form.destinatario} onChange={handleChange}
                className="w-full border rounded-lg px-3 py-2 mt-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                placeholder="Nombre completo" />
            </div>
            <div>
              <label className="text-sm text-gray-600">Teléfono destinatario</label>
              <input name="telefonoDestinatario" value={form.telefonoDestinatario} onChange={handleChange}
                className="w-full border rounded-lg px-3 py-2 mt-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                placeholder="7XXXXXXX" />
            </div>
            <div>
              <label className="text-sm text-gray-600">Descripción *</label>
              <input name="descripcion" value={form.descripcion} onChange={handleChange}
                className="w-full border rounded-lg px-3 py-2 mt-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                placeholder="Ej: Ropa, documentos, etc." />
            </div>
            <div>
              <label className="text-sm text-gray-600">Precio (Bs.) *</label>
              <input name="precio" value={form.precio} onChange={handleChange}
                type="number" min="0"
                className="w-full border rounded-lg px-3 py-2 mt-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                placeholder="0" />
            </div>
            <div>
              <label className="text-sm text-gray-600">¿Quién paga?</label>
              <select name="quienPaga" value={form.quienPaga} onChange={handleChange}
                className="w-full border rounded-lg px-3 py-2 mt-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400">
                <option value="remitente">Remitente (paga al enviar)</option>
                <option value="destinatario">Destinatario (contra entrega)</option>
              </select>
            </div>
            <div>
              <label className="text-sm text-gray-600">Chofer asignado</label>
              <div className="w-full border rounded-lg px-3 py-2 mt-1 text-sm bg-gray-50 text-gray-500">
                {choferes[0]
                  ? `${choferes[0].nombre} — ${choferes[0].placa}`
                  : "Sin choferes disponibles"}
              </div>
            </div>
          </div>
          <button
            onClick={handleSubmit}
            disabled={guardando}
            className="mt-4 bg-green-600 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition disabled:opacity-50"
          >
            {guardando ? "Guardando..." : "Registrar encomienda"}
          </button>
        </div>
      )}

      {cargando ? (
        <p className="text-gray-400 text-sm">Cargando encomiendas...</p>
      ) : encomiendas.length === 0 ? (
        <p className="text-gray-400 text-sm">No hay encomiendas registradas aún.</p>
      ) : (
        <div className="space-y-3">
          {encomiendas.map((enc) => (
            <div key={enc.id} className="bg-white rounded-xl shadow p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div>
                <p className="font-mono text-sm font-bold text-blue-600">{enc.codigo}</p>
                <p className="text-sm text-gray-700 mt-1">
                  <span className="font-medium">{enc.remitente}</span>
                  <span className="text-gray-400"> → </span>
                  <span className="font-medium">{enc.destinatario}</span>
                </p>
                <p className="text-xs text-gray-400 mt-1">{enc.descripcion}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-semibold text-gray-700">Bs. {enc.precio}</span>
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${ESTADOS[enc.estado]?.color}`}>
                  {ESTADOS[enc.estado]?.label}
                </span>
                {enc.estado !== "ENTREGADO" && (
                  <select
                    value={enc.estado}
                    onChange={async (e) => { await actualizarEstado(enc.id, e.target.value, enc.choferAsignado?.id); cargarDatos(); }}
                    className="text-xs border rounded-lg px-2 py-1 focus:outline-none"
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