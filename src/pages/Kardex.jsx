import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { obtenerSocio, obtenerMovimientosSocio, registrarMovimientoSocio, actualizarSocio } from "../firebase/administracion";

const DIAS_ALERTA = 30;

function diasParaVencer(fecha) {
  if (!fecha) return null;
  const hoy = new Date();
  const vence = new Date(fecha);
  const diff = Math.ceil((vence - hoy) / (1000 * 60 * 60 * 24));
  return diff;
}

function BadgeVencimiento({ fecha, label }) {
  if (!fecha) return <span className="text-xs" style={{ color: "#9ca3af" }}>No registrado</span>;
  const dias = diasParaVencer(fecha);
  let bg, color, texto;
  if (dias < 0) { bg = "#fef2f2"; color = "#dc2626"; texto = `Vencido hace ${Math.abs(dias)} días`; }
  else if (dias <= DIAS_ALERTA) { bg = "#fef9c3"; color = "#854d0e"; texto = `Vence en ${dias} días`; }
  else { bg = "#dcfce7"; color = "#166534"; texto = `Vigente · ${dias} días`; }
  return (
    <span className="text-xs px-2 py-1 rounded-full font-medium" style={{ backgroundColor: bg, color }}>
      {texto}
    </span>
  );
}

const TIPOS_MOVIMIENTO = [
  { value: "cuota", label: "Cuota mensual", icono: "📅" },
  { value: "multa", label: "Multa", icono: "⚠️" },
  { value: "bono", label: "Bono", icono: "🎁" },
  { value: "descuento", label: "Descuento", icono: "🏷️" },
  { value: "deuda", label: "Deuda", icono: "📌" },
  { value: "ingreso", label: "Ingreso extra", icono: "💚" },
  { value: "egreso", label: "Egreso", icono: "💸" },
];

const TIPOS_INCIDENTE = [
  { value: "multa_transito", label: "Multa de tránsito" },
  { value: "accidente", label: "Accidente" },
  { value: "parte_policial", label: "Parte policial" },
  { value: "siniestro", label: "Siniestro" },
  { value: "reclamo_seguro", label: "Reclamo al seguro" },
  { value: "otro", label: "Otro" },
];

const inputClass = "w-full px-3 py-2 rounded-xl text-sm outline-none transition";
const inputStyle = { backgroundColor: "#f3f4f6", border: "1.5px solid #e5e7eb", color: "#111827" };
const inputFocus = (e) => e.target.style.borderColor = "#157f3c";
const inputBlur = (e) => e.target.style.borderColor = "#e5e7eb";

export default function Kardex() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [socio, setSocio] = useState(null);
  const [movimientos, setMovimientos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [tab, setTab] = useState("info");
  const [guardando, setGuardando] = useState(false);
  const [editando, setEditando] = useState(false);
  const [formEdit, setFormEdit] = useState({});

  const [formMovimiento, setFormMovimiento] = useState({
    tipo: "cuota", descripcion: "", monto: "", mes: "", pagado: true,
  });

  const [formIncidente, setFormIncidente] = useState({
    tipo: "multa_transito", descripcion: "", fecha: "", monto: "",
  });

  useEffect(() => {
    cargarDatos();
  }, [id]);

  const cargarDatos = async () => {
    setCargando(true);
    const [s, m] = await Promise.all([
      obtenerSocio(id),
      obtenerMovimientosSocio(id),
    ]);
    setSocio(s);
    setFormEdit(s || {});
    setMovimientos(m);
    setCargando(false);
  };

  const handleGuardarEdicion = async () => {
    setGuardando(true);
    await actualizarSocio(id, formEdit);
    setEditando(false);
    setGuardando(false);
    cargarDatos();
  };

  const handleRegistrarMovimiento = async () => {
    if (!formMovimiento.descripcion || !formMovimiento.monto) {
      alert("Descripción y monto son obligatorios"); return;
    }
    setGuardando(true);
    await registrarMovimientoSocio({
      socioId: id,
      socioNombre: socio.nombre,
      ...formMovimiento,
      monto: Number(formMovimiento.monto),
    });
    setFormMovimiento({ tipo: "cuota", descripcion: "", monto: "", mes: "", pagado: true });
    await cargarDatos();
    setGuardando(false);
  };

  const handleRegistrarIncidente = async () => {
    if (!formIncidente.descripcion || !formIncidente.fecha) {
      alert("Descripción y fecha son obligatorios"); return;
    }
    setGuardando(true);
    await registrarMovimientoSocio({
      socioId: id,
      socioNombre: socio.nombre,
      tipo: "incidente",
      subTipo: formIncidente.tipo,
      descripcion: formIncidente.descripcion,
      fecha: formIncidente.fecha,
      monto: Number(formIncidente.monto) || 0,
      pagado: false,
    });
    setFormIncidente({ tipo: "multa_transito", descripcion: "", fecha: "", monto: "" });
    await cargarDatos();
    setGuardando(false);
  };

  const saldo = movimientos.reduce((acc, m) => {
    if (["bono", "ingreso", "descuento"].includes(m.tipo)) return acc + (m.monto || 0);
    if (["multa", "deuda", "egreso", "cuota"].includes(m.tipo) && !m.pagado) return acc - (m.monto || 0);
    return acc;
  }, 0);

  const tabs = [
    { id: "info", label: "Información", icono: "👤" },
    { id: "vehiculo", label: "Vehículo", icono: "🚗" },
    { id: "flujo", label: "Flujo financiero", icono: "💰" },
    { id: "incidentes", label: "Incidentes", icono: "⚠️" },
  ];

  if (cargando) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#f3f4f6" }}>
        <p style={{ color: "#9ca3af" }}>Cargando kardex...</p>
      </div>
    );
  }

  if (!socio) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#f3f4f6" }}>
        <p style={{ color: "#dc2626" }}>Socio no encontrado</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#f3f4f6" }}>

      {/* Navbar */}
      <nav style={{ backgroundColor: "#157f3c", zIndex: 1001, position: "relative" }}>
        <div className="px-4 md:px-6 flex items-center h-16 gap-3">
          <img src="/images/LogoMC.png" alt="Mixto Cliza"
            className="w-20 h-20 object-contain flex-shrink-0 -my-2" />
          <div className="flex-1">
            <h1 className="text-white font-bold text-base leading-none">Mixto Cliza</h1>
            <p className="text-xs leading-none mt-0.5" style={{ color: "#a7f3d0" }}>
              Kardex del socio
            </p>
          </div>
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-all"
            style={{ backgroundColor: "rgba(255,255,255,0.15)", color: "#ffffff" }}
          >
            ← Volver
          </button>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 py-6">

        {/* Header del socio */}
        <div
          className="rounded-2xl p-5 mb-5 shadow-sm"
          style={{ backgroundColor: "#ffffff", border: "1px solid #e5e7eb" }}
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0"
                style={{ backgroundColor: "#f0fdf4" }}
              >
                🚗
              </div>
              <div>
                <h2 className="text-xl font-black" style={{ color: "#111827" }}>
                  {socio.nombre}
                </h2>
                <p className="text-sm mt-0.5" style={{ color: "#6b7280" }}>
                  CI: {socio.ci} {socio.ciExpedicion} · Placa: {socio.placa}
                </p>
                <div className="flex gap-2 mt-1.5">
                  <span
                    className="text-xs px-2 py-0.5 rounded-full font-medium"
                    style={{
                      backgroundColor: socio.linea === "interprovincial" ? "#dbeafe" : "#f3e8ff",
                      color: socio.linea === "interprovincial" ? "#1e40af" : "#7c3aed",
                    }}
                  >
                    {socio.linea === "interprovincial" ? "🚗 Cliza–Cbba" : "📡 Radio Móvil"}
                  </span>
                  <span
                    className="text-xs px-2 py-0.5 rounded-full font-medium"
                    style={{
                      backgroundColor: socio.estado === "activo" ? "#dcfce7" : "#fef2f2",
                      color: socio.estado === "activo" ? "#166534" : "#dc2626",
                    }}
                  >
                    {socio.estado === "activo" ? "● Activo" : "● Suspendido"}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div
                className="text-center px-4 py-2 rounded-xl"
                style={{ backgroundColor: saldo >= 0 ? "#f0fdf4" : "#fef2f2", border: `1px solid ${saldo >= 0 ? "#86efac" : "#fca5a5"}` }}
              >
                <p className="text-lg font-black" style={{ color: saldo >= 0 ? "#157f3c" : "#dc2626" }}>
                  Bs. {saldo}
                </p>
                <p className="text-xs" style={{ color: "#6b7280" }}>Saldo</p>
              </div>
              <button
                onClick={() => setEditando(!editando)}
                className="px-4 py-2 rounded-xl text-sm font-semibold transition-all"
                style={{
                  backgroundColor: editando ? "#6b7280" : "#f3f4f6",
                  color: editando ? "#ffffff" : "#374151",
                  border: "1px solid #e5e7eb",
                }}
              >
                {editando ? "✕ Cancelar" : "✏️ Editar"}
              </button>
            </div>
          </div>
        </div>

        {/* Alertas de vencimiento */}
        {[
          { label: "SOAT", fecha: socio.vencimientoSOAT },
          { label: "Revisión técnica", fecha: socio.vencimientoRevisionTecnica },
          { label: "Matrícula", fecha: socio.vencimientoMatricula },
          { label: "Licencia", fecha: socio.licenciaVencimiento },
        ].filter(item => {
          if (!item.fecha) return false;
          const dias = diasParaVencer(item.fecha);
          return dias !== null && dias <= DIAS_ALERTA;
        }).length > 0 && (
          <div
            className="rounded-2xl p-4 mb-5"
            style={{ backgroundColor: "#fef9c3", border: "1px solid #fde047" }}
          >
            <p className="text-xs font-bold mb-2" style={{ color: "#854d0e" }}>
              ⚠️ Documentos próximos a vencer
            </p>
            <div className="flex flex-wrap gap-2">
              {[
                { label: "SOAT", fecha: socio.vencimientoSOAT },
                { label: "Revisión técnica", fecha: socio.vencimientoRevisionTecnica },
                { label: "Matrícula", fecha: socio.vencimientoMatricula },
                { label: "Licencia", fecha: socio.licenciaVencimiento },
              ].filter(item => {
                if (!item.fecha) return false;
                const dias = diasParaVencer(item.fecha);
                return dias !== null && dias <= DIAS_ALERTA;
              }).map(item => (
                <span key={item.label}
                  className="text-xs px-3 py-1 rounded-full font-medium"
                  style={{ backgroundColor: "#ffffff", color: "#854d0e", border: "1px solid #fde047" }}>
                  {item.label}: <BadgeVencimiento fecha={item.fecha} />
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 mb-5 overflow-x-auto pb-1">
          {tabs.map((t) => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all flex-shrink-0"
              style={{
                backgroundColor: tab === t.id ? "#157f3c" : "#ffffff",
                color: tab === t.id ? "#ffffff" : "#374151",
                border: tab === t.id ? "none" : "1px solid #e5e7eb",
              }}>
              {t.icono} {t.label}
            </button>
          ))}
        </div>

        {/* TAB: INFORMACIÓN PERSONAL */}
        {tab === "info" && (
          <div className="rounded-2xl shadow-sm overflow-hidden"
            style={{ backgroundColor: "#ffffff", border: "1px solid #e5e7eb" }}>

            {editando ? (
              <div className="p-6">
                <p className="font-semibold mb-4" style={{ color: "#111827" }}>
                  Editar información personal
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    { key: "nombre", label: "Nombre completo", col: 2 },
                    { key: "fechaNacimiento", label: "Fecha de nacimiento", type: "date" },
                    { key: "ci", label: "CI" },
                    { key: "telefono", label: "Teléfono" },
                    { key: "telefonoEmergencia", label: "Teléfono emergencia" },
                    { key: "direccion", label: "Dirección", col: 2 },
                    { key: "licenciaNumero", label: "N° Licencia" },
                    { key: "licenciaEmision", label: "Emisión licencia", type: "date" },
                    { key: "licenciaVencimiento", label: "Vencimiento licencia", type: "date" },
                  ].map((f) => (
                    <div key={f.key} className={f.col === 2 ? "md:col-span-2" : ""}>
                      <label className="text-xs font-medium mb-1.5 block" style={{ color: "#374151" }}>
                        {f.label}
                      </label>
                      <input
                        type={f.type || "text"}
                        value={formEdit[f.key] || ""}
                        onChange={(e) => setFormEdit({ ...formEdit, [f.key]: e.target.value })}
                        className={inputClass} style={inputStyle}
                        onFocus={inputFocus} onBlur={inputBlur}
                      />
                    </div>
                  ))}
                </div>
                <button onClick={handleGuardarEdicion} disabled={guardando}
                  className="mt-5 px-6 py-2.5 rounded-xl text-sm font-semibold text-white"
                  style={{ backgroundColor: guardando ? "#86b89a" : "#157f3c" }}>
                  {guardando ? "Guardando..." : "✓ Guardar cambios"}
                </button>
              </div>
            ) : (
              <div className="divide-y" style={{ borderColor: "#f3f4f6" }}>
                {/* Datos personales */}
                <div className="p-5">
                  <p className="text-xs font-bold mb-4 flex items-center gap-2"
                    style={{ color: "#157f3c" }}>
                    👤 Datos personales
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      { label: "Nombre completo", valor: socio.nombre },
                      { label: "Fecha de nacimiento", valor: socio.fechaNacimiento },
                      { label: "CI", valor: `${socio.ci} ${socio.ciExpedicion}` },
                      { label: "Dirección", valor: socio.direccion },
                      { label: "Teléfono", valor: socio.telefono },
                      { label: "Teléfono emergencia", valor: socio.telefonoEmergencia },
                      { label: "Fecha de ingreso", valor: socio.fechaIngreso?.toDate ? socio.fechaIngreso.toDate().toLocaleDateString("es-BO") : "—" },
                    ].map((item) => (
                      <div key={item.label}>
                        <p className="text-xs" style={{ color: "#9ca3af" }}>{item.label}</p>
                        <p className="text-sm font-semibold mt-0.5" style={{ color: "#111827" }}>
                          {item.valor || "—"}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Licencia */}
                <div className="p-5">
                  <p className="text-xs font-bold mb-4 flex items-center gap-2"
                    style={{ color: "#157f3c" }}>
                    🪪 Licencia de conducir
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[
                      { label: "Número", valor: socio.licenciaNumero },
                      { label: "Clase", valor: socio.licenciaClase ? `Clase ${socio.licenciaClase}` : "—" },
                      { label: "Categoría", valor: socio.licenciaCategoria },
                      { label: "Emisión", valor: socio.licenciaEmision },
                    ].map((item) => (
                      <div key={item.label}>
                        <p className="text-xs" style={{ color: "#9ca3af" }}>{item.label}</p>
                        <p className="text-sm font-semibold mt-0.5" style={{ color: "#111827" }}>
                          {item.valor || "—"}
                        </p>
                      </div>
                    ))}
                    <div>
                      <p className="text-xs mb-1" style={{ color: "#9ca3af" }}>Vencimiento</p>
                      <BadgeVencimiento fecha={socio.licenciaVencimiento} />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB: VEHÍCULO */}
        {tab === "vehiculo" && (
          <div className="rounded-2xl shadow-sm overflow-hidden"
            style={{ backgroundColor: "#ffffff", border: "1px solid #e5e7eb" }}>

            {editando ? (
              <div className="p-6">
                <p className="font-semibold mb-4" style={{ color: "#111827" }}>
                  Editar información del vehículo
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    { key: "placa", label: "Placa" },
                    { key: "vin", label: "VIN" },
                    { key: "marca", label: "Marca" },
                    { key: "modelo", label: "Modelo" },
                    { key: "anio", label: "Año" },
                    { key: "color", label: "Color" },
                    { key: "numeroMotor", label: "N° Motor" },
                    { key: "numeroChassis", label: "N° Chasis" },
                    { key: "vencimientoSOAT", label: "Vence SOAT", type: "date" },
                    { key: "vencimientoRevisionTecnica", label: "Vence Rev. Técnica", type: "date" },
                    { key: "vencimientoMatricula", label: "Vence Matrícula", type: "date" },
                  ].map((f) => (
                    <div key={f.key}>
                      <label className="text-xs font-medium mb-1.5 block" style={{ color: "#374151" }}>
                        {f.label}
                      </label>
                      <input
                        type={f.type || "text"}
                        value={formEdit[f.key] || ""}
                        onChange={(e) => setFormEdit({ ...formEdit, [f.key]: e.target.value })}
                        className={inputClass} style={inputStyle}
                        onFocus={inputFocus} onBlur={inputBlur}
                      />
                    </div>
                  ))}
                </div>
                <button onClick={handleGuardarEdicion} disabled={guardando}
                  className="mt-5 px-6 py-2.5 rounded-xl text-sm font-semibold text-white"
                  style={{ backgroundColor: guardando ? "#86b89a" : "#157f3c" }}>
                  {guardando ? "Guardando..." : "✓ Guardar cambios"}
                </button>
              </div>
            ) : (
              <div className="divide-y" style={{ borderColor: "#f3f4f6" }}>
                <div className="p-5">
                  <p className="text-xs font-bold mb-4" style={{ color: "#157f3c" }}>
                    🚗 Ficha técnica
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {[
                      { label: "Placa", valor: socio.placa },
                      { label: "VIN", valor: socio.vin },
                      { label: "Marca", valor: socio.marca },
                      { label: "Modelo", valor: socio.modelo },
                      { label: "Año", valor: socio.anio },
                      { label: "Color", valor: socio.color },
                      { label: "Combustible", valor: socio.tipoCombustible },
                      { label: "N° Motor", valor: socio.numeroMotor },
                      { label: "N° Chasis", valor: socio.numeroChassis },
                    ].map((item) => (
                      <div key={item.label}>
                        <p className="text-xs" style={{ color: "#9ca3af" }}>{item.label}</p>
                        <p className="text-sm font-semibold mt-0.5" style={{ color: "#111827" }}>
                          {item.valor || "—"}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-5">
                  <p className="text-xs font-bold mb-4" style={{ color: "#157f3c" }}>
                    📋 Documentación legal
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[
                      { label: "SOAT", fecha: socio.vencimientoSOAT },
                      { label: "Revisión técnica", fecha: socio.vencimientoRevisionTecnica },
                      { label: "Matrícula", fecha: socio.vencimientoMatricula },
                    ].map((item) => (
                      <div key={item.label}>
                        <p className="text-xs mb-1" style={{ color: "#9ca3af" }}>{item.label}</p>
                        <p className="text-xs mb-1" style={{ color: "#6b7280" }}>
                          {item.fecha || "No registrado"}
                        </p>
                        <BadgeVencimiento fecha={item.fecha} />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB: FLUJO FINANCIERO */}
        {tab === "flujo" && (
          <div>
            {/* Resumen */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
              {[
                { label: "Cuotas pendientes", valor: movimientos.filter(m => m.tipo === "cuota" && !m.pagado).length, color: "#dc2626", bg: "#fef2f2", border: "#fca5a5" },
                { label: "Multas", valor: movimientos.filter(m => m.tipo === "multa").length, color: "#854d0e", bg: "#fef9c3", border: "#fde047" },
                { label: "Bonos", valor: movimientos.filter(m => m.tipo === "bono").length, color: "#166534", bg: "#dcfce7", border: "#86efac" },
                { label: "Saldo", valor: `Bs. ${saldo}`, color: saldo >= 0 ? "#157f3c" : "#dc2626", bg: saldo >= 0 ? "#f0fdf4" : "#fef2f2", border: saldo >= 0 ? "#86efac" : "#fca5a5" },
              ].map((stat) => (
                <div key={stat.label} className="rounded-2xl p-4 text-center"
                  style={{ backgroundColor: stat.bg, border: `1px solid ${stat.border}` }}>
                  <p className="text-xl font-black" style={{ color: stat.color }}>{stat.valor}</p>
                  <p className="text-xs mt-1" style={{ color: "#6b7280" }}>{stat.label}</p>
                </div>
              ))}
            </div>

            {/* Formulario nuevo movimiento */}
            <div className="rounded-2xl p-5 mb-5 shadow-sm"
              style={{ backgroundColor: "#ffffff", border: "1px solid #e5e7eb" }}>
              <p className="font-semibold mb-4" style={{ color: "#111827" }}>
                Registrar movimiento
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium mb-1.5 block" style={{ color: "#374151" }}>Tipo</label>
                  <select value={formMovimiento.tipo}
                    onChange={(e) => setFormMovimiento({ ...formMovimiento, tipo: e.target.value })}
                    className={inputClass} style={inputStyle}>
                    {TIPOS_MOVIMIENTO.map(t => (
                      <option key={t.value} value={t.value}>{t.icono} {t.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium mb-1.5 block" style={{ color: "#374151" }}>Monto (Bs.)</label>
                  <input type="number" value={formMovimiento.monto}
                    onChange={(e) => setFormMovimiento({ ...formMovimiento, monto: e.target.value })}
                    placeholder="50"
                    className={inputClass} style={inputStyle}
                    onFocus={inputFocus} onBlur={inputBlur} />
                </div>
                <div className="md:col-span-2">
                  <label className="text-xs font-medium mb-1.5 block" style={{ color: "#374151" }}>Descripción</label>
                  <input value={formMovimiento.descripcion}
                    onChange={(e) => setFormMovimiento({ ...formMovimiento, descripcion: e.target.value })}
                    placeholder="Ej: Cuota mayo 2026"
                    className={inputClass} style={inputStyle}
                    onFocus={inputFocus} onBlur={inputBlur} />
                </div>
                {formMovimiento.tipo === "cuota" && (
                  <>
                    <div>
                      <label className="text-xs font-medium mb-1.5 block" style={{ color: "#374151" }}>Mes</label>
                      <input type="month" value={formMovimiento.mes}
                        onChange={(e) => setFormMovimiento({ ...formMovimiento, mes: e.target.value })}
                        className={inputClass} style={inputStyle}
                        onFocus={inputFocus} onBlur={inputBlur} />
                    </div>
                    <div>
                      <label className="text-xs font-medium mb-1.5 block" style={{ color: "#374151" }}>Estado</label>
                      <select value={formMovimiento.pagado}
                        onChange={(e) => setFormMovimiento({ ...formMovimiento, pagado: e.target.value === "true" })}
                        className={inputClass} style={inputStyle}>
                        <option value="true">Pagado</option>
                        <option value="false">Pendiente</option>
                      </select>
                    </div>
                  </>
                )}
              </div>
              <button onClick={handleRegistrarMovimiento} disabled={guardando}
                className="mt-4 px-6 py-2.5 rounded-xl text-sm font-semibold text-white"
                style={{ backgroundColor: guardando ? "#86b89a" : "#157f3c" }}>
                {guardando ? "Guardando..." : "✓ Registrar"}
              </button>
            </div>

            {/* Lista movimientos */}
            <div className="space-y-2">
              {movimientos.filter(m => m.tipo !== "incidente").length === 0 ? (
                <div className="text-center py-12 rounded-2xl"
                  style={{ backgroundColor: "#ffffff", border: "1px dashed #d1d5db" }}>
                  <p className="text-2xl mb-2">💰</p>
                  <p className="text-sm" style={{ color: "#9ca3af" }}>Sin movimientos registrados</p>
                </div>
              ) : movimientos.filter(m => m.tipo !== "incidente").map((mov) => {
                const tipoInfo = TIPOS_MOVIMIENTO.find(t => t.value === mov.tipo);
                const esPositivo = ["bono", "ingreso", "descuento"].includes(mov.tipo);
                return (
                  <div key={mov.id} className="rounded-2xl p-4 flex justify-between items-center"
                    style={{ backgroundColor: "#ffffff", border: "1px solid #e5e7eb" }}>
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center text-base"
                        style={{ backgroundColor: "#f9fafb" }}>
                        {tipoInfo?.icono || "💸"}
                      </div>
                      <div>
                        <p className="text-sm font-semibold" style={{ color: "#111827" }}>
                          {mov.descripcion}
                        </p>
                        <p className="text-xs" style={{ color: "#9ca3af" }}>
                          {tipoInfo?.label} {mov.mes && `· ${mov.mes}`}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-black"
                        style={{ color: esPositivo ? "#157f3c" : "#dc2626" }}>
                        {esPositivo ? "+" : "-"} Bs. {mov.monto}
                      </span>
                      {mov.tipo === "cuota" && (
                        <span className="text-xs px-2 py-1 rounded-full"
                          style={{
                            backgroundColor: mov.pagado ? "#dcfce7" : "#fef2f2",
                            color: mov.pagado ? "#166534" : "#dc2626",
                          }}>
                          {mov.pagado ? "✅" : "❌"}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB: INCIDENTES */}
        {tab === "incidentes" && (
          <div>
            {/* Formulario */}
            <div className="rounded-2xl p-5 mb-5 shadow-sm"
              style={{ backgroundColor: "#ffffff", border: "1px solid #e5e7eb" }}>
              <p className="font-semibold mb-4" style={{ color: "#111827" }}>
                Registrar incidente
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium mb-1.5 block" style={{ color: "#374151" }}>Tipo</label>
                  <select value={formIncidente.tipo}
                    onChange={(e) => setFormIncidente({ ...formIncidente, tipo: e.target.value })}
                    className={inputClass} style={inputStyle}>
                    {TIPOS_INCIDENTE.map(t => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium mb-1.5 block" style={{ color: "#374151" }}>Fecha</label>
                  <input type="date" value={formIncidente.fecha}
                    onChange={(e) => setFormIncidente({ ...formIncidente, fecha: e.target.value })}
                    className={inputClass} style={inputStyle}
                    onFocus={inputFocus} onBlur={inputBlur} />
                </div>
                <div className="md:col-span-2">
                  <label className="text-xs font-medium mb-1.5 block" style={{ color: "#374151" }}>Descripción</label>
                  <input value={formIncidente.descripcion}
                    onChange={(e) => setFormIncidente({ ...formIncidente, descripcion: e.target.value })}
                    placeholder="Descripción del incidente..."
                    className={inputClass} style={inputStyle}
                    onFocus={inputFocus} onBlur={inputBlur} />
                </div>
                <div>
                  <label className="text-xs font-medium mb-1.5 block" style={{ color: "#374151" }}>
                    Monto involucrado (Bs.) — opcional
                  </label>
                  <input type="number" value={formIncidente.monto}
                    onChange={(e) => setFormIncidente({ ...formIncidente, monto: e.target.value })}
                    placeholder="0"
                    className={inputClass} style={inputStyle}
                    onFocus={inputFocus} onBlur={inputBlur} />
                </div>
              </div>
              <button onClick={handleRegistrarIncidente} disabled={guardando}
                className="mt-4 px-6 py-2.5 rounded-xl text-sm font-semibold text-white"
                style={{ backgroundColor: guardando ? "#86b89a" : "#157f3c" }}>
                {guardando ? "Guardando..." : "✓ Registrar incidente"}
              </button>
            </div>

            {/* Lista incidentes */}
            <div className="space-y-2">
              {movimientos.filter(m => m.tipo === "incidente").length === 0 ? (
                <div className="text-center py-12 rounded-2xl"
                  style={{ backgroundColor: "#ffffff", border: "1px dashed #d1d5db" }}>
                  <p className="text-2xl mb-2">⚠️</p>
                  <p className="text-sm" style={{ color: "#9ca3af" }}>Sin incidentes registrados</p>
                </div>
              ) : movimientos.filter(m => m.tipo === "incidente").map((inc) => (
                <div key={inc.id} className="rounded-2xl p-4"
                  style={{ backgroundColor: "#ffffff", border: "1px solid #e5e7eb" }}>
                  <div className="flex justify-between items-start">
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center text-base flex-shrink-0"
                        style={{ backgroundColor: "#fef9c3" }}>
                        ⚠️
                      </div>
                      <div>
                        <p className="text-sm font-semibold" style={{ color: "#111827" }}>
                          {inc.descripcion}
                        </p>
                        <p className="text-xs mt-0.5" style={{ color: "#9ca3af" }}>
                          {TIPOS_INCIDENTE.find(t => t.value === inc.subTipo)?.label || inc.subTipo}
                          {" · "}{inc.fecha}
                        </p>
                      </div>
                    </div>
                    {inc.monto > 0 && (
                      <span className="text-sm font-bold flex-shrink-0" style={{ color: "#dc2626" }}>
                        Bs. {inc.monto}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}