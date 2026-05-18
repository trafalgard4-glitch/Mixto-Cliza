import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { escucharTaxis, registrarViaje, encontrarChoferCercano, obtenerViajes } from "../firebase/radioTaxi";
import { obtenerChoferes } from "../firebase/choferes";
import { ref, onValue, off } from "firebase/database";
import { rtdb } from "../firebase/config";

const iconoLibre = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34],
});
const iconoOcupado = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34],
});
const iconoCliente = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34],
});

const CENTRO_CLIZA = [-17.5982, -65.9317];

function ClickMapa({ onClickMapa }) {
  useMapEvents({ click(e) { onClickMapa(e.latlng.lat, e.latlng.lng); } });
  return null;
}

export default function RadioTaxi() {
  const [taxis, setTaxis] = useState({});
  const [choferes, setChoferes] = useState([]);
  const [pedido, setPedido] = useState({ direccion: "", lat: null, lng: null });
  const [cercano, setCercano] = useState(null);
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [modoClick, setModoClick] = useState(false);
  const [viajes, setViajes] = useState([]);

  useEffect(() => {
    obtenerChoferes().then(setChoferes);
    const unsub = escucharTaxis(setTaxis);
    cargarViajes();
    const notifRef = ref(rtdb, "notificaciones");
    onValue(notifRef, () => { setTimeout(() => cargarViajes(), 1000); });
    return () => { unsub(); off(notifRef); };
  }, []);

  const cargarViajes = async () => {
    const data = await obtenerViajes();
    setViajes(data);
  };

  const libres = Object.values(taxis).filter((t) => t.estado === "LIBRE").length;
  const ocupados = Object.values(taxis).filter((t) => t.estado === "OCUPADO").length;

  const handleClickMapa = (lat, lng) => {
    if (!modoClick) return;
    setPedido((prev) => ({ ...prev, lat, lng }));
    setCercano(null);
    setMensaje(`📍 Ubicación marcada`);
    setModoClick(false);
  };

  const buscarCercano = () => {
    if (!pedido.lat || !pedido.lng) { alert("Primero marca la ubicación en el mapa"); return; }
    const resultado = encontrarChoferCercano(taxis, choferes, pedido.lat, pedido.lng);
    setCercano(resultado);
    if (!resultado) setMensaje("❌ No hay choferes libres disponibles");
    else setMensaje("");
  };

  const asignarViaje = async () => {
    if (!cercano) return;
    setGuardando(true);
    await registrarViaje({
      choferId: cercano.id,
      choferNombre: cercano.nombre || "Sin nombre",
      choferPlaca: cercano.placa || "",
      direccionCliente: pedido.direccion || `${pedido.lat?.toFixed(5)}, ${pedido.lng?.toFixed(5)}`,
      latCliente: pedido.lat,
      lngCliente: pedido.lng,
      distanciaKm: cercano.distancia.toFixed(2),
    });
    setMensaje(`✅ Viaje asignado a ${cercano.nombre || cercano.id}`);
    setCercano(null);
    setPedido({ direccion: "", lat: null, lng: null });
    setGuardando(false);
    cargarViajes();
  };

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto">

      {/* Header */}
      <div className="mb-6">
        <h2 className="text-xl font-bold" style={{ color: "#111827" }}>🚕 Radio Taxi</h2>
        <p className="text-xs mt-0.5" style={{ color: "#6b7280" }}>
          Despacho en tiempo real · Cliza
        </p>
      </div>

      {/* Contadores */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        {[
          { label: "Libres", valor: libres, color: "#157f3c", bg: "#f0fdf4", border: "#86efac" },
          { label: "Ocupados", valor: ocupados, color: "#dc2626", bg: "#fef2f2", border: "#fca5a5" },
          { label: "Total activos", valor: libres + ocupados, color: "#111827", bg: "#f9fafb", border: "#e5e7eb" },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-2xl p-4 text-center"
            style={{ backgroundColor: stat.bg, border: `1px solid ${stat.border}` }}
          >
            <p className="text-2xl font-black" style={{ color: stat.color }}>{stat.valor}</p>
            <p className="text-xs mt-1" style={{ color: "#6b7280" }}>{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Mapa + Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">

        {/* Mapa */}
        <div
          className="lg:col-span-2 rounded-2xl overflow-hidden relative shadow-sm"
          style={{ height: "420px", border: "1px solid #e5e7eb" }}
        >
          {modoClick && (
            <div
              className="absolute top-3 left-1/2 -translate-x-1/2 z-[999] px-4 py-2 rounded-full text-xs font-semibold shadow-lg"
              style={{ backgroundColor: "#157f3c", color: "#ffffff" }}
            >
              🖱️ Click en el mapa para marcar al cliente
            </div>
          )}
          <MapContainer
            center={CENTRO_CLIZA} zoom={14}
            style={{ height: "100%", width: "100%", cursor: modoClick ? "crosshair" : "grab" }}
          >
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            <ClickMapa onClickMapa={handleClickMapa} />
            {Object.entries(taxis).map(([id, taxi]) => {
              const info = choferes.find((c) => c.id === id);
              return (
                <Marker key={id} position={[taxi.lat, taxi.lng]}
                  icon={taxi.estado === "LIBRE" ? iconoLibre : iconoOcupado}>
                  <Popup>
                    <p className="font-bold">{info?.nombre || id}</p>
                    <p className="text-xs">Placa: {info?.placa || "—"}</p>
                    <p className="text-xs">Estado: {taxi.estado}</p>
                  </Popup>
                </Marker>
              );
            })}
            {pedido.lat && pedido.lng && (
              <Marker position={[pedido.lat, pedido.lng]} icon={iconoCliente}>
                <Popup>📍 Ubicación del cliente</Popup>
              </Marker>
            )}
          </MapContainer>
        </div>

        {/* Panel pedido */}
        <div
          className="rounded-2xl p-5 shadow-sm"
          style={{ backgroundColor: "#ffffff", border: "1px solid #e5e7eb" }}
        >
          <h3 className="font-semibold mb-4" style={{ color: "#111827" }}>
            Nuevo pedido
          </h3>

          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium mb-1.5 block" style={{ color: "#374151" }}>
                Dirección (referencia)
              </label>
              <input
                value={pedido.direccion}
                onChange={(e) => setPedido({ ...pedido, direccion: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                style={{ backgroundColor: "#f3f4f6", border: "1.5px solid #e5e7eb", color: "#111827" }}
                onFocus={(e) => e.target.style.borderColor = "#157f3c"}
                onBlur={(e) => e.target.style.borderColor = "#e5e7eb"}
                placeholder="Ej: frente al mercado central"
              />
            </div>

            <button
              onClick={() => { setModoClick(true); setMensaje(""); }}
              className="w-full py-2.5 rounded-xl text-sm font-semibold transition-all"
              style={{
                backgroundColor: pedido.lat ? "#f0fdf4" : "#f3f4f6",
                border: `2px solid ${pedido.lat ? "#86efac" : "#e5e7eb"}`,
                color: pedido.lat ? "#157f3c" : "#6b7280",
              }}
            >
              {modoClick ? "🖱️ Click en el mapa..."
                : pedido.lat ? "📍 Ubicación marcada ✓"
                : "📍 Marcar en el mapa"}
            </button>

            {pedido.lat && (
              <p className="text-xs text-center" style={{ color: "#9ca3af" }}>
                {pedido.lat.toFixed(5)}, {pedido.lng.toFixed(5)}
              </p>
            )}

            <button
              onClick={buscarCercano}
              disabled={!pedido.lat}
              className="w-full py-2.5 rounded-xl text-sm font-semibold text-white transition-all"
              style={{ backgroundColor: !pedido.lat ? "#86b89a" : "#157f3c" }}
            >
              🔍 Buscar chofer cercano
            </button>

            {cercano && (
              <div
                className="rounded-xl p-3"
                style={{ backgroundColor: "#f0fdf4", border: "1.5px solid #86efac" }}
              >
                <p className="text-sm font-bold" style={{ color: "#157f3c" }}>
                  ✓ Sugerido: {cercano.nombre || cercano.id}
                </p>
                <p className="text-xs mt-0.5" style={{ color: "#166534" }}>
                  Placa: {cercano.placa || "—"} · {cercano.distancia.toFixed(2)} km
                </p>
                <button
                  onClick={asignarViaje}
                  disabled={guardando}
                  className="mt-2 w-full py-2 rounded-xl text-sm font-semibold text-white"
                  style={{ backgroundColor: guardando ? "#86b89a" : "#157f3c" }}
                >
                  {guardando ? "Asignando..." : "Confirmar asignación →"}
                </button>
              </div>
            )}

            {mensaje && (
              <p className="text-sm text-center font-medium" style={{ color: "#157f3c" }}>
                {mensaje}
              </p>
            )}
          </div>

          {/* Leyenda */}
          <div className="flex gap-3 mt-4 pt-4" style={{ borderTop: "1px solid #f3f4f6" }}>
            <span className="text-xs flex items-center gap-1" style={{ color: "#6b7280" }}>
              <span className="w-2 h-2 rounded-full bg-green-500 inline-block" /> Libre
            </span>
            <span className="text-xs flex items-center gap-1" style={{ color: "#6b7280" }}>
              <span className="w-2 h-2 rounded-full bg-red-500 inline-block" /> Ocupado
            </span>
            <span className="text-xs flex items-center gap-1" style={{ color: "#6b7280" }}>
              <span className="w-2 h-2 rounded-full bg-blue-500 inline-block" /> Cliente
            </span>
          </div>
        </div>
      </div>

      {/* Registro de viajes */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold" style={{ color: "#111827" }}>
            Viajes del día
          </h3>
          <div className="flex gap-2">
            <span
              className="text-xs px-3 py-1 rounded-full font-medium"
              style={{ backgroundColor: "#dbeafe", color: "#1e40af" }}
            >
              🚗 En curso: {viajes.filter(v => v.estado === "EN_CURSO").length}
            </span>
            <span
              className="text-xs px-3 py-1 rounded-full font-medium"
              style={{ backgroundColor: "#dcfce7", color: "#166534" }}
            >
              ✅ Completados: {viajes.filter(v => v.estado === "COMPLETADO").length}
            </span>
          </div>
        </div>

        {viajes.length === 0 ? (
          <div
            className="text-center py-12 rounded-2xl"
            style={{ backgroundColor: "#ffffff", border: "1px dashed #d1d5db" }}
          >
            <p className="text-3xl mb-2">🚕</p>
            <p className="text-sm" style={{ color: "#9ca3af" }}>Sin viajes registrados hoy</p>
          </div>
        ) : (
          <div className="space-y-2">
            {viajes.map((viaje) => (
              <div
                key={viaje.id}
                className="rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-3"
                style={{ backgroundColor: "#ffffff", border: "1px solid #e5e7eb" }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: viaje.estado === "COMPLETADO" ? "#22c55e" : "#3b82f6" }}
                  />
                  <div>
                    <p className="text-sm font-bold" style={{ color: "#111827" }}>
                      {viaje.choferNombre}
                      <span className="font-normal ml-2 text-xs" style={{ color: "#6b7280" }}>
                        {viaje.choferPlaca}
                      </span>
                    </p>
                    <p className="text-xs mt-0.5" style={{ color: "#6b7280" }}>
                      📍 {viaje.direccionCliente} · {viaje.distanciaKm} km
                    </p>
                  </div>
                </div>
                <span
                  className="text-xs px-3 py-1.5 rounded-full font-medium flex-shrink-0"
                  style={{
                    backgroundColor: viaje.estado === "COMPLETADO" ? "#dcfce7" : "#dbeafe",
                    color: viaje.estado === "COMPLETADO" ? "#166534" : "#1e40af",
                  }}
                >
                  {viaje.estado === "COMPLETADO" ? "✅ Completado" : "🚗 En curso"}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}