import { useState, useEffect } from "react";
import {
  obtenerSocios, agregarSocio, actualizarSocio,
  registrarCuota, obtenerCuotas,
  obtenerMovimientosCaja, registrarMovimientoCaja
} from "../firebase/administracion";

const TABS = ["interprovincial", "radiomovil", "caja"];

const inputClass = "w-full px-3 py-2 rounded-xl text-sm outline-none transition";
const inputStyle = { backgroundColor: "#f3f4f6", border: "1.5px solid #e5e7eb", color: "#111827" };
const inputFocus = (e) => e.target.style.borderColor = "#157f3c";
const inputBlur = (e) => e.target.style.borderColor = "#e5e7eb";

function ListaSocios({
  lista, linea, cargando,
  mostrarFormSocio, setMostrarFormSocio,
  formSocio, setFormSocio,
  guardando, handleAgregarSocio,
  verCuotas, setVerCuotas,
  socioSeleccionado, setSocioSeleccionado,
  cuotasSocio,
  formCuota, setFormCuota,
  handleRegistrarCuota,
  handleVerCuotas, handleEstadoSocio,
}) {
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <p className="text-sm" style={{ color: "#6b7280" }}>{lista.length} socios registrados</p>
        <button
          onClick={() => setMostrarFormSocio(!mostrarFormSocio)}
          className="px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all"
          style={{ backgroundColor: mostrarFormSocio ? "#6b7280" : "#157f3c" }}
        >
          {mostrarFormSocio ? "✕ Cancelar" : "+ Agregar socio"}
        </button>
      </div>

      {mostrarFormSocio && (
        <div className="rounded-2xl p-6 mb-4 shadow-sm"
          style={{ backgroundColor: "#ffffff", border: "1px solid #e5e7eb" }}>
          <h3 className="font-semibold mb-1" style={{ color: "#111827" }}>Nuevo socio</h3>
          <p className="text-xs mb-4" style={{ color: "#6b7280" }}>
            {linea === "interprovincial"
              ? "🚗 Línea Cliza — Cochabamba · Encomiendas"
              : "📡 Radio Móvil · Servicio dentro de Cliza"}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { key: "nombre", label: "Nombre completo *", placeholder: "Juan Mamani" },
              { key: "ci", label: "CI *", placeholder: "4521876" },
              { key: "placa", label: "Placa *", placeholder: "2341-CBB" },
              { key: "telefono", label: "Teléfono", placeholder: "76543210" },
            ].map((f) => (
              <div key={f.key}>
                <label className="text-xs font-medium mb-1.5 block" style={{ color: "#374151" }}>
                  {f.label}
                </label>
                <input
                  value={formSocio[f.key]}
                  onChange={(e) => setFormSocio({ ...formSocio, [f.key]: e.target.value })}
                  placeholder={f.placeholder}
                  className={inputClass} style={inputStyle}
                  onFocus={inputFocus} onBlur={inputBlur}
                />
              </div>
            ))}
          </div>
          <button onClick={handleAgregarSocio} disabled={guardando}
            className="mt-5 px-6 py-2.5 rounded-xl text-sm font-semibold text-white"
            style={{ backgroundColor: guardando ? "#86b89a" : "#157f3c" }}>
            {guardando ? "Guardando..." : "✓ Registrar socio"}
          </button>
        </div>
      )}

      {verCuotas && socioSeleccionado && (
        <div className="rounded-2xl p-6 mb-4 shadow-sm"
          style={{ backgroundColor: "#ffffff", border: "1.5px solid #86efac" }}>
          <div className="flex justify-between items-center mb-4">
            <div>
              <p className="font-bold" style={{ color: "#111827" }}>{socioSeleccionado.nombre}</p>
              <p className="text-xs" style={{ color: "#6b7280" }}>Placa: {socioSeleccionado.placa}</p>
            </div>
            <button onClick={() => { setVerCuotas(false); setSocioSeleccionado(null); }}
              className="text-sm px-3 py-1 rounded-lg"
              style={{ color: "#6b7280", backgroundColor: "#f3f4f6" }}>
              ✕ Cerrar
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="text-xs font-medium mb-1.5 block" style={{ color: "#374151" }}>Mes</label>
              <input type="month" value={formCuota.mes}
                onChange={(e) => setFormCuota({ ...formCuota, mes: e.target.value })}
                className={inputClass} style={inputStyle} onFocus={inputFocus} onBlur={inputBlur} />
            </div>
            <div>
              <label className="text-xs font-medium mb-1.5 block" style={{ color: "#374151" }}>Monto (Bs.)</label>
              <input type="number" value={formCuota.monto}
                onChange={(e) => setFormCuota({ ...formCuota, monto: e.target.value })}
                placeholder="50" className={inputClass} style={inputStyle}
                onFocus={inputFocus} onBlur={inputBlur} />
            </div>
            <div>
              <label className="text-xs font-medium mb-1.5 block" style={{ color: "#374151" }}>Estado</label>
              <select value={formCuota.pagado}
                onChange={(e) => setFormCuota({ ...formCuota, pagado: e.target.value === "true" })}
                className={inputClass} style={inputStyle}>
                <option value="true">Pagado</option>
                <option value="false">Pendiente</option>
              </select>
            </div>
          </div>
          <button onClick={handleRegistrarCuota} disabled={guardando}
            className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white mb-4"
            style={{ backgroundColor: guardando ? "#86b89a" : "#157f3c" }}>
            {guardando ? "Guardando..." : "✓ Registrar cuota"}
          </button>

          <div className="space-y-2 max-h-48 overflow-y-auto">
            {cuotasSocio.length === 0 ? (
              <p className="text-sm" style={{ color: "#9ca3af" }}>Sin cuotas registradas</p>
            ) : cuotasSocio.map((cuota) => (
              <div key={cuota.id} className="flex justify-between items-center px-4 py-2.5 rounded-xl"
                style={{ backgroundColor: "#f9fafb", border: "1px solid #e5e7eb" }}>
                <p className="text-sm font-medium" style={{ color: "#374151" }}>{cuota.mes}</p>
                <div className="flex items-center gap-3">
                  <p className="text-sm font-bold" style={{ color: "#111827" }}>Bs. {cuota.monto}</p>
                  <span className="text-xs px-2.5 py-1 rounded-full font-medium"
                    style={{
                      backgroundColor: cuota.pagado ? "#dcfce7" : "#fef2f2",
                      color: cuota.pagado ? "#166534" : "#dc2626",
                    }}>
                    {cuota.pagado ? "✅ Pagado" : "❌ Pendiente"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {cargando ? (
        <p className="text-sm" style={{ color: "#9ca3af" }}>Cargando socios...</p>
      ) : lista.length === 0 ? (
        <div className="text-center py-16 rounded-2xl"
          style={{ backgroundColor: "#ffffff", border: "1px dashed #d1d5db" }}>
          <p className="text-3xl mb-2">👥</p>
          <p className="text-sm" style={{ color: "#9ca3af" }}>No hay socios en esta línea aún</p>
        </div>
      ) : (
        <div className="space-y-2">
          {lista.map((socio) => (
            <div key={socio.id}
              className="rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 hover:shadow-md transition-all"
              style={{ backgroundColor: "#ffffff", border: "1px solid #e5e7eb" }}>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
                  style={{ backgroundColor: "#f0fdf4" }}>
                  🚗
                </div>
                <div>
                  <p className="font-semibold" style={{ color: "#111827" }}>{socio.nombre}</p>
                  <p className="text-xs mt-0.5" style={{ color: "#6b7280" }}>
                    CI: {socio.ci} · Placa: {socio.placa}
                    {socio.telefono ? ` · Tel: ${socio.telefono}` : ""}
                  </p>
                  <span className="inline-block text-xs px-2 py-0.5 rounded-full mt-1 font-medium"
                    style={{
                      backgroundColor: socio.estado === "activo" ? "#dcfce7" : "#fef2f2",
                      color: socio.estado === "activo" ? "#166534" : "#dc2626",
                    }}>
                    {socio.estado === "activo" ? "● Activo" : "● Suspendido"}
                  </span>
                </div>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <button onClick={() => handleVerCuotas(socio)}
                  className="text-xs px-3 py-1.5 rounded-xl font-semibold text-white"
                  style={{ backgroundColor: "#f59e0b" }}>
                  💰 Cuotas
                </button>
                <button
                  onClick={() => handleEstadoSocio(socio.id, socio.estado === "activo" ? "suspendido" : "activo")}
                  className="text-xs px-3 py-1.5 rounded-xl font-semibold text-white"
                  style={{ backgroundColor: socio.estado === "activo" ? "#dc2626" : "#157f3c" }}>
                  {socio.estado === "activo" ? "Suspender" : "Reactivar"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Administracion() {
  const [tab, setTab] = useState("interprovincial");
  const [socios, setSocios] = useState([]);
  const [caja, setCaja] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [mostrarFormSocio, setMostrarFormSocio] = useState(false);
  const [mostrarFormCaja, setMostrarFormCaja] = useState(false);
  const [socioSeleccionado, setSocioSeleccionado] = useState(null);
  const [cuotasSocio, setCuotasSocio] = useState([]);
  const [guardando, setGuardando] = useState(false);
  const [verCuotas, setVerCuotas] = useState(false);

  const [formSocio, setFormSocio] = useState({
    nombre: "", ci: "", placa: "", telefono: "", linea: "interprovincial",
  });
  const [formCaja, setFormCaja] = useState({ tipo: "ingreso", descripcion: "", monto: "" });
  const [formCuota, setFormCuota] = useState({ mes: "", monto: "", pagado: true });

  useEffect(() => { cargarDatos(); }, []);

  useEffect(() => {
    setMostrarFormSocio(false);
    setVerCuotas(false);
    setSocioSeleccionado(null);
    setFormSocio((prev) => ({
      ...prev,
      linea: tab === "radiomovil" ? "radiomovil" : "interprovincial",
    }));
  }, [tab]);

  const cargarDatos = async () => {
    setCargando(true);
    const [s, c] = await Promise.all([obtenerSocios(), obtenerMovimientosCaja()]);
    setSocios(s);
    setCaja(c);
    setCargando(false);
  };

  const sociosInterprovincial = socios.filter((s) => s.linea === "interprovincial");
  const sociosRadiomovil = socios.filter((s) => s.linea === "radiomovil");

  const handleAgregarSocio = async () => {
    if (!formSocio.nombre || !formSocio.ci || !formSocio.placa) {
      alert("Nombre, CI y placa son obligatorios"); return;
    }
    setGuardando(true);
    await agregarSocio({ ...formSocio, estado: "activo" });
    setFormSocio({ nombre: "", ci: "", placa: "", telefono: "", linea: formSocio.linea });
    setMostrarFormSocio(false);
    setGuardando(false);
    cargarDatos();
  };

  const handleEstadoSocio = async (id, estado) => {
    await actualizarSocio(id, { estado });
    cargarDatos();
  };

  const handleVerCuotas = async (socio) => {
    setSocioSeleccionado(socio);
    const cuotas = await obtenerCuotas(socio.id);
    setCuotasSocio(cuotas);
    setVerCuotas(true);
  };

  const handleRegistrarCuota = async () => {
    if (!formCuota.mes || !formCuota.monto) { alert("Mes y monto son obligatorios"); return; }
    setGuardando(true);
    await registrarCuota({
      socioId: socioSeleccionado.id,
      socioNombre: socioSeleccionado.nombre,
      mes: formCuota.mes,
      monto: Number(formCuota.monto),
      pagado: formCuota.pagado,
    });
    setFormCuota({ mes: "", monto: "", pagado: true });
    const cuotas = await obtenerCuotas(socioSeleccionado.id);
    setCuotasSocio(cuotas);
    setGuardando(false);
  };

  const handleMovimientoCaja = async () => {
    if (!formCaja.descripcion || !formCaja.monto) { alert("Descripción y monto son obligatorios"); return; }
    setGuardando(true);
    await registrarMovimientoCaja({ ...formCaja, monto: Number(formCaja.monto) });
    setFormCaja({ tipo: "ingreso", descripcion: "", monto: "" });
    setMostrarFormCaja(false);
    setGuardando(false);
    cargarDatos();
  };

  const totalCaja = caja.reduce((acc, m) => m.tipo === "ingreso" ? acc + m.monto : acc - m.monto, 0);

  const tabConfig = [
    { id: "interprovincial", label: "Cliza–Cbba", icono: "🚗", count: sociosInterprovincial.length },
    { id: "radiomovil", label: "Radio Móvil", icono: "📡", count: sociosRadiomovil.length },
    { id: "caja", label: "Caja", icono: "🏦", count: null },
  ];

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto">

      <div className="mb-6">
        <h2 className="text-xl font-bold" style={{ color: "#111827" }}>👥 Administración</h2>
        <p className="text-xs mt-0.5" style={{ color: "#6b7280" }}>Gestión de socios y finanzas</p>
      </div>

      {/* Resumen */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {[
          { label: "Socios Cliza–Cbba", valor: sociosInterprovincial.length, color: "#157f3c", bg: "#f0fdf4", border: "#86efac" },
          { label: "Socios Radio Móvil", valor: sociosRadiomovil.length, color: "#7c3aed", bg: "#f5f3ff", border: "#c4b5fd" },
          { label: "Total activos", valor: socios.filter(s => s.estado === "activo").length, color: "#111827", bg: "#f9fafb", border: "#e5e7eb" },
          { label: "Saldo en caja", valor: `Bs. ${totalCaja}`, color: totalCaja >= 0 ? "#157f3c" : "#dc2626", bg: totalCaja >= 0 ? "#f0fdf4" : "#fef2f2", border: totalCaja >= 0 ? "#86efac" : "#fca5a5" },
        ].map((stat) => (
          <div key={stat.label} className="rounded-2xl p-4 text-center"
            style={{ backgroundColor: stat.bg, border: `1px solid ${stat.border}` }}>
            <p className="text-xl font-black" style={{ color: stat.color }}>{stat.valor}</p>
            <p className="text-xs mt-1" style={{ color: "#6b7280" }}>{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-5">
        {tabConfig.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all"
            style={{
              backgroundColor: tab === t.id ? "#157f3c" : "#ffffff",
              color: tab === t.id ? "#ffffff" : "#374151",
              border: tab === t.id ? "none" : "1px solid #e5e7eb",
            }}>
            {t.icono} {t.label}
            {t.count !== null && (
              <span className="text-xs px-1.5 py-0.5 rounded-full"
                style={{
                  backgroundColor: tab === t.id ? "rgba(255,255,255,0.25)" : "#f3f4f6",
                  color: tab === t.id ? "#ffffff" : "#6b7280",
                }}>
                {t.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {tab === "interprovincial" && (
        <ListaSocios lista={sociosInterprovincial} linea="interprovincial"
          cargando={cargando}
          mostrarFormSocio={mostrarFormSocio} setMostrarFormSocio={setMostrarFormSocio}
          formSocio={formSocio} setFormSocio={setFormSocio}
          guardando={guardando} handleAgregarSocio={handleAgregarSocio}
          verCuotas={verCuotas} setVerCuotas={setVerCuotas}
          socioSeleccionado={socioSeleccionado} setSocioSeleccionado={setSocioSeleccionado}
          cuotasSocio={cuotasSocio}
          formCuota={formCuota} setFormCuota={setFormCuota}
          handleRegistrarCuota={handleRegistrarCuota}
          handleVerCuotas={handleVerCuotas} handleEstadoSocio={handleEstadoSocio}
        />
      )}
      {tab === "radiomovil" && (
        <ListaSocios lista={sociosRadiomovil} linea="radiomovil"
          cargando={cargando}
          mostrarFormSocio={mostrarFormSocio} setMostrarFormSocio={setMostrarFormSocio}
          formSocio={formSocio} setFormSocio={setFormSocio}
          guardando={guardando} handleAgregarSocio={handleAgregarSocio}
          verCuotas={verCuotas} setVerCuotas={setVerCuotas}
          socioSeleccionado={socioSeleccionado} setSocioSeleccionado={setSocioSeleccionado}
          cuotasSocio={cuotasSocio}
          formCuota={formCuota} setFormCuota={setFormCuota}
          handleRegistrarCuota={handleRegistrarCuota}
          handleVerCuotas={handleVerCuotas} handleEstadoSocio={handleEstadoSocio}
        />
      )}

      {tab === "caja" && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <div>
              <p className="text-2xl font-black"
                style={{ color: totalCaja >= 0 ? "#157f3c" : "#dc2626" }}>
                Bs. {totalCaja}
              </p>
              <p className="text-xs" style={{ color: "#6b7280" }}>Saldo actual</p>
            </div>
            <button onClick={() => setMostrarFormCaja(!mostrarFormCaja)}
              className="px-4 py-2 rounded-xl text-sm font-semibold text-white"
              style={{ backgroundColor: mostrarFormCaja ? "#6b7280" : "#157f3c" }}>
              {mostrarFormCaja ? "✕ Cancelar" : "+ Nuevo movimiento"}
            </button>
          </div>

          {mostrarFormCaja && (
            <div className="rounded-2xl p-6 mb-4 shadow-sm"
              style={{ backgroundColor: "#ffffff", border: "1px solid #e5e7eb" }}>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-medium mb-1.5 block" style={{ color: "#374151" }}>Tipo</label>
                  <select value={formCaja.tipo}
                    onChange={(e) => setFormCaja({ ...formCaja, tipo: e.target.value })}
                    className={inputClass} style={inputStyle}>
                    <option value="ingreso">Ingreso</option>
                    <option value="egreso">Egreso</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium mb-1.5 block" style={{ color: "#374151" }}>Descripción</label>
                  <input value={formCaja.descripcion}
                    onChange={(e) => setFormCaja({ ...formCaja, descripcion: e.target.value })}
                    placeholder="Ej: Cuotas de mayo"
                    className={inputClass} style={inputStyle}
                    onFocus={inputFocus} onBlur={inputBlur} />
                </div>
                <div>
                  <label className="text-xs font-medium mb-1.5 block" style={{ color: "#374151" }}>Monto (Bs.)</label>
                  <input type="number" value={formCaja.monto}
                    onChange={(e) => setFormCaja({ ...formCaja, monto: e.target.value })}
                    placeholder="100"
                    className={inputClass} style={inputStyle}
                    onFocus={inputFocus} onBlur={inputBlur} />
                </div>
              </div>
              <button onClick={handleMovimientoCaja} disabled={guardando}
                className="mt-5 px-6 py-2.5 rounded-xl text-sm font-semibold text-white"
                style={{ backgroundColor: guardando ? "#86b89a" : "#157f3c" }}>
                {guardando ? "Guardando..." : "✓ Registrar movimiento"}
              </button>
            </div>
          )}

          {caja.length === 0 ? (
            <div className="text-center py-16 rounded-2xl"
              style={{ backgroundColor: "#ffffff", border: "1px dashed #d1d5db" }}>
              <p className="text-3xl mb-2">🏦</p>
              <p className="text-sm" style={{ color: "#9ca3af" }}>Sin movimientos registrados</p>
            </div>
          ) : (
            <div className="space-y-2">
              {caja.map((mov) => (
                <div key={mov.id}
                  className="rounded-2xl p-4 flex justify-between items-center"
                  style={{ backgroundColor: "#ffffff", border: "1px solid #e5e7eb" }}>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                      style={{ backgroundColor: mov.tipo === "ingreso" ? "#f0fdf4" : "#fef2f2" }}>
                      {mov.tipo === "ingreso" ? "⬆️" : "⬇️"}
                    </div>
                    <p className="text-sm font-medium" style={{ color: "#111827" }}>
                      {mov.descripcion}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-black"
                      style={{ color: mov.tipo === "ingreso" ? "#157f3c" : "#dc2626" }}>
                      {mov.tipo === "ingreso" ? "+" : "-"} Bs. {mov.monto}
                    </span>
                    <span className="text-xs px-2.5 py-1 rounded-full font-medium"
                      style={{
                        backgroundColor: mov.tipo === "ingreso" ? "#dcfce7" : "#fef2f2",
                        color: mov.tipo === "ingreso" ? "#166534" : "#dc2626",
                      }}>
                      {mov.tipo}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}