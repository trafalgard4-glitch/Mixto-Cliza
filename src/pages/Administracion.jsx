import { useState, useEffect } from "react";
import {
  obtenerSocios, agregarSocio, actualizarSocio,
  registrarCuota, obtenerCuotas,
  obtenerMovimientosCaja, registrarMovimientoCaja
} from "../firebase/administracion";

// ← ListaSocios está FUERA del componente principal, eso arregla el bug del input
function ListaSocios({
  lista, linea, cargando,
  mostrarFormSocio, setMostrarFormSocio,
  formSocio, setFormSocio,
  guardando, handleAgregarSocio,
  verCuotas, setVerCuotas,
  socioSeleccionado, setSocioSeleccionado,
  cuotasSocio, formCuota, setFormCuota,
  handleRegistrarCuota, handleVerCuotas, handleEstadoSocio,
}) {
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <p className="text-sm text-gray-500">{lista.length} socios registrados</p>
        <button
          onClick={() => setMostrarFormSocio(!mostrarFormSocio)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition"
        >
          {mostrarFormSocio ? "Cancelar" : "+ Agregar socio"}
        </button>
      </div>

      {mostrarFormSocio && (
        <div className="bg-white rounded-xl shadow p-6 mb-4">
          <h3 className="font-semibold text-gray-700 mb-1">Nuevo socio</h3>
          <p className="text-xs text-gray-400 mb-4">
            {linea === "interprovincial"
              ? "Línea Cliza — Cochabamba · Encomiendas"
              : "Radio Móvil · Servicio dentro de Cliza"}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-gray-500">Nombre completo *</label>
              <input
                value={formSocio.nombre}
                onChange={(e) => setFormSocio({ ...formSocio, nombre: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 mt-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                placeholder="Juan Mamani"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500">CI *</label>
              <input
                value={formSocio.ci}
                onChange={(e) => setFormSocio({ ...formSocio, ci: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 mt-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                placeholder="4521876"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500">Placa *</label>
              <input
                value={formSocio.placa}
                onChange={(e) => setFormSocio({ ...formSocio, placa: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 mt-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                placeholder="2341-CBB"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500">Teléfono</label>
              <input
                value={formSocio.telefono}
                onChange={(e) => setFormSocio({ ...formSocio, telefono: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 mt-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                placeholder="76543210"
              />
            </div>
          </div>
          <button
            onClick={handleAgregarSocio}
            disabled={guardando}
            className="mt-4 bg-green-600 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition disabled:opacity-50"
          >
            {guardando ? "Guardando..." : "Registrar socio"}
          </button>
        </div>
      )}

      {verCuotas && socioSeleccionado && (
        <div className="bg-white rounded-xl shadow p-6 mb-4">
          <div className="flex justify-between items-center mb-4">
            <div>
              <p className="font-bold text-gray-800">{socioSeleccionado.nombre}</p>
              <p className="text-xs text-gray-400">Placa: {socioSeleccionado.placa}</p>
            </div>
            <button
              onClick={() => { setVerCuotas(false); setSocioSeleccionado(null); }}
              className="text-sm text-gray-400 hover:text-gray-600"
            >
              ✕ Cerrar
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="text-xs text-gray-500">Mes</label>
              <input
                type="date"
                value={formCuota.mes}
                onChange={(e) => setFormCuota({ ...formCuota, mes: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 mt-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500">Motivo</label>
              <input
                value={formCuota.motivo || ""}
                onChange={(e) => setFormCuota({ ...formCuota, motivo: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 mt-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                placeholder="Ej: Cuota mensual, multa, etc."
              />
            </div>
            <div>
              <label className="text-xs text-gray-500">Monto (Bs.)</label>
              <input
                type="number"
                value={formCuota.monto}
                onChange={(e) => setFormCuota({ ...formCuota, monto: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 mt-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                placeholder="50"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500">Estado</label>
              <select
                value={formCuota.pagado}
                onChange={(e) => setFormCuota({ ...formCuota, pagado: e.target.value === "true" })}
                className="w-full border rounded-lg px-3 py-2 mt-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                <option value="true">Pagado</option>
                <option value="false">Pendiente</option>
              </select>
            </div>
          </div>
          <button
            onClick={handleRegistrarCuota}
            disabled={guardando}
            className="bg-green-600 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition disabled:opacity-50 mb-4"
          >
            {guardando ? "Guardando..." : "Registrar cuota"}
          </button>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {cuotasSocio.length === 0 ? (
              <p className="text-gray-400 text-sm">Sin cuotas registradas</p>
            ) : cuotasSocio.map((cuota) => (
              <div key={cuota.id} className="flex justify-between items-center border rounded-lg px-4 py-2">
                <div>
                    <p className="text-sm text-gray-700">{cuota.mes}</p>
                    {cuota.motivo && (
                      <p className="text-xs text-gray-400">{cuota.motivo}</p>
                    )}
                  </div>
                <div className="flex items-center gap-3">
                  <p className="text-sm font-medium">Bs. {cuota.monto}</p>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    cuota.pagado ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                  }`}>
                    {cuota.pagado ? "✅ Pagado" : "❌ Pendiente"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {cargando ? (
        <p className="text-gray-400 text-sm">Cargando socios...</p>
      ) : lista.length === 0 ? (
        <p className="text-gray-400 text-sm">No hay socios registrados en esta línea.</p>
      ) : (
        <div className="space-y-2">
          {lista.map((socio) => (
            <div key={socio.id}
              className="bg-white rounded-xl shadow p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div>
                <p className="font-semibold text-gray-800">{socio.nombre}</p>
                <p className="text-xs text-gray-400 mt-0.5">
                  CI: {socio.ci} · Placa: {socio.placa}
                  {socio.telefono ? ` · Tel: ${socio.telefono}` : ""}
                </p>
                <span className={`inline-block text-xs px-2 py-0.5 rounded-full mt-1 ${
                  socio.estado === "activo"
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                }`}>
                  {socio.estado}
                </span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleVerCuotas(socio)}
                  className="text-xs bg-yellow-500 text-white px-3 py-1.5 rounded-lg hover:bg-yellow-600 transition"
                >
                  💰 Cuotas
                </button>
                <button
                  onClick={() => handleEstadoSocio(socio.id, socio.estado === "activo" ? "suspendido" : "activo")}
                  className={`text-xs px-3 py-1.5 rounded-lg transition text-white ${
                    socio.estado === "activo"
                      ? "bg-red-500 hover:bg-red-600"
                      : "bg-green-500 hover:bg-green-600"
                  }`}
                >
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

  const [formCaja, setFormCaja] = useState({
    tipo: "ingreso", descripcion: "", monto: "",
  });

  const [formCuota, setFormCuota] = useState({
    mes: "", monto: "", pagado: true,
  });

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

  const totalCaja = caja.reduce((acc, m) => {
    return m.tipo === "ingreso" ? acc + m.monto : acc - m.monto;
  }, 0);

  const handleAgregarSocio = async () => {
    if (!formSocio.nombre || !formSocio.ci || !formSocio.placa) {
      alert("Nombre, CI y placa son obligatorios");
      return;
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
    if (!formCuota.mes || !formCuota.monto) {
      alert("Mes y monto son obligatorios");
      return;
    }
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
    if (!formCaja.descripcion || !formCaja.monto) {
      alert("Descripción y monto son obligatorios");
      return;
    }
    setGuardando(true);
    await registrarMovimientoCaja({ ...formCaja, monto: Number(formCaja.monto) });
    setFormCaja({ tipo: "ingreso", descripcion: "", monto: "" });
    setMostrarFormCaja(false);
    setGuardando(false);
    cargarDatos();
  };

  const propsSocios = {
    cargando, mostrarFormSocio, setMostrarFormSocio,
    formSocio, setFormSocio, guardando, handleAgregarSocio,
    verCuotas, setVerCuotas, socioSeleccionado, setSocioSeleccionado,
    cuotasSocio, formCuota, setFormCuota,
    handleRegistrarCuota, handleVerCuotas, handleEstadoSocio,
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold text-gray-800 mb-4">Administración</h2>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <div className="bg-white rounded-xl shadow p-4 text-center">
          <p className="text-2xl font-bold text-blue-600">{sociosInterprovincial.length}</p>
          <p className="text-xs text-gray-400 mt-1">Socios Cliza–Cbba</p>
        </div>
        <div className="bg-white rounded-xl shadow p-4 text-center">
          <p className="text-2xl font-bold text-purple-600">{sociosRadiomovil.length}</p>
          <p className="text-xs text-gray-400 mt-1">Socios Radio Móvil</p>
        </div>
        <div className="bg-white rounded-xl shadow p-4 text-center">
          <p className="text-2xl font-bold text-gray-700">
            {socios.filter((s) => s.estado === "activo").length}
          </p>
          <p className="text-xs text-gray-400 mt-1">Total activos</p>
        </div>
        <div className="bg-white rounded-xl shadow p-4 text-center">
          <p className={`text-2xl font-bold ${totalCaja >= 0 ? "text-green-600" : "text-red-500"}`}>
            Bs. {totalCaja}
          </p>
          <p className="text-xs text-gray-400 mt-1">Saldo en caja</p>
        </div>
      </div>

      <div className="flex gap-2 mb-4">
        {["interprovincial", "radiomovil", "caja"].map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`text-sm px-4 py-2 rounded-lg transition font-medium ${
              tab === t ? "bg-blue-600 text-white" : "bg-white text-gray-500 hover:bg-gray-100 shadow"
            }`}>
            {t === "interprovincial" ? "🚗 Cliza–Cbba"
              : t === "radiomovil" ? "📡 Radio Móvil"
              : "🏦 Caja"}
          </button>
        ))}
      </div>

      {tab === "interprovincial" && (
        <ListaSocios lista={sociosInterprovincial} linea="interprovincial" {...propsSocios} />
      )}
      {tab === "radiomovil" && (
        <ListaSocios lista={sociosRadiomovil} linea="radiomovil" {...propsSocios} />
      )}

      {tab === "caja" && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <div>
              <p className={`text-2xl font-bold ${totalCaja >= 0 ? "text-green-600" : "text-red-500"}`}>
                Bs. {totalCaja}
              </p>
              <p className="text-xs text-gray-400">Saldo actual</p>
            </div>
            <button onClick={() => setMostrarFormCaja(!mostrarFormCaja)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition">
              {mostrarFormCaja ? "Cancelar" : "+ Nuevo movimiento"}
            </button>
          </div>

          {mostrarFormCaja && (
            <div className="bg-white rounded-xl shadow p-6 mb-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                    <div>
                  <label className="text-xs text-gray-500">Fecha</label>
                  <input
                    type="date"
                    value={formCaja.fecha || ""}
                    onChange={(e) => setFormCaja({ ...formCaja, fecha: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2 mt-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                </div>
                  <label className="text-xs text-gray-500">Tipo</label>
                  <select value={formCaja.tipo}
                    onChange={(e) => setFormCaja({ ...formCaja, tipo: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2 mt-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400">
                    <option value="ingreso">Ingreso</option>
                    <option value="egreso">Egreso</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gray-500">Descripción</label>
                  <input value={formCaja.descripcion}
                    onChange={(e) => setFormCaja({ ...formCaja, descripcion: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2 mt-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                    placeholder="Ej: Cuotas de mayo" />
                </div>
                <div>
                  <label className="text-xs text-gray-500">Monto (Bs.)</label>
                  <input type="number" value={formCaja.monto}
                    onChange={(e) => setFormCaja({ ...formCaja, monto: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2 mt-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                    placeholder="100" />
                </div>
              </div>
              <button onClick={handleMovimientoCaja} disabled={guardando}
                className="mt-4 bg-green-600 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition disabled:opacity-50">
                {guardando ? "Guardando..." : "Registrar movimiento"}
              </button>
            </div>
          )}

          <div className="space-y-2">
            {caja.length === 0 ? (
              <p className="text-gray-400 text-sm">Sin movimientos registrados.</p>
            ) : caja.map((mov) => (
              <div key={mov.id}
                className="bg-white rounded-xl shadow p-4 flex justify-between items-center">
                <div>
                  <p className="text-sm text-gray-700">{mov.descripcion}</p>
                  {mov.fecha && (
                    <p className="text-xs text-gray-400">
                      {typeof mov.fecha === "string"
                        ? mov.fecha
                        : mov.fecha?.toDate?.()?.toLocaleDateString("es-BO") || ""}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-sm font-bold ${
                    mov.tipo === "ingreso" ? "text-green-600" : "text-red-500"
                  }`}>
                    {mov.tipo === "ingreso" ? "+" : "-"} Bs. {mov.monto}
                  </span>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    mov.tipo === "ingreso"
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}>
                    {mov.tipo}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}