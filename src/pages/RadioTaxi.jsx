import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { escucharTaxis, registrarViaje, encontrarChoferCercano, obtenerViajes, finalizarViaje } from "../firebase/radioTaxi";
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

// Componente que detecta clicks en el mapa
function ClickMapa({ onClickMapa }) {
  useMapEvents({
    click(e) {
      onClickMapa(e.latlng.lat, e.latlng.lng);
    },
  });
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

    // Escucha notificaciones para detectar viajes completados
    const notifRef = ref(rtdb, "notificaciones");
    onValue(notifRef, () => {
      setTimeout(() => cargarViajes(), 1000);
    });
    return () => {
      unsub();
      off(notifRef);
    };
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
    setMensaje(`📍 Ubicación marcada: ${lat.toFixed(5)}, ${lng.toFixed(5)}`);
    setModoClick(false);
  };

  const buscarCercano = () => {
    if (!pedido.lat || !pedido.lng) {
      alert("Primero marca la ubicación del cliente en el mapa");
      return;
    }
    const resultado = encontrarChoferCercano(
      taxis, choferes, pedido.lat, pedido.lng
    );
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
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold text-gray-800 mb-4">Radio Taxi</h2>

      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="bg-white rounded-xl shadow p-4 text-center">
          <p className="text-2xl font-bold text-green-600">{libres}</p>
          <p className="text-xs text-gray-400 mt-1">Libres</p>
        </div>
        <div className="bg-white rounded-xl shadow p-4 text-center">
          <p className="text-2xl font-bold text-red-500">{ocupados}</p>
          <p className="text-xs text-gray-400 mt-1">Ocupados</p>
        </div>
        <div className="bg-white rounded-xl shadow p-4 text-center">
          <p className="text-2xl font-bold text-gray-700">{libres + ocupados}</p>
          <p className="text-xs text-gray-400 mt-1">Total activos</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 rounded-xl shadow overflow-hidden relative" style={{ height: "450px" }}>
          {modoClick && (
            <div className="absolute top-2 left-1/2 -translate-x-1/2 z-[999] bg-blue-600 text-white text-xs px-4 py-2 rounded-full shadow">
              🖱️ Click en el mapa para marcar la ubicación del cliente
            </div>
          )}
          <MapContainer
            center={CENTRO_CLIZA}
            zoom={14}
            style={{ height: "100%", width: "100%", cursor: modoClick ? "crosshair" : "grab" }}
          >
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            <ClickMapa onClickMapa={handleClickMapa} />

            {/* Marcadores de taxis */}
            {Object.entries(taxis).map(([id, taxi]) => {
              const info = choferes.find((c) => c.id === id);
              return (
                <Marker
                  key={id}
                  position={[taxi.lat, taxi.lng]}
                  icon={taxi.estado === "LIBRE" ? iconoLibre : iconoOcupado}
                >
                  <Popup>
                    <p className="font-bold">{info?.nombre || id}</p>
                    <p className="text-xs">Placa: {info?.placa || "—"}</p>
                    <p className="text-xs">Estado: {taxi.estado}</p>
                  </Popup>
                </Marker>
              );
            })}

            {/* Marcador del cliente */}
            {pedido.lat && pedido.lng && (
              <Marker position={[pedido.lat, pedido.lng]} icon={iconoCliente}>
                <Popup>📍 Ubicación del cliente</Popup>
              </Marker>
            )}
          </MapContainer>
        </div>

        <div className="bg-white rounded-xl shadow p-4">
          <h3 className="font-semibold text-gray-700 mb-3">Nuevo pedido</h3>
          <div className="space-y-3">

            <div>
              <label className="text-xs text-gray-500">Dirección (referencia)</label>
              <input
                value={pedido.direccion}
                onChange={(e) => setPedido({ ...pedido, direccion: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 text-sm mt-1 focus:outline-none focus:ring-2 focus:ring-blue-400"
                placeholder="Ej: frente al mercado central"
              />
            </div>

            <button
              onClick={() => { setModoClick(true); setMensaje(""); }}
              className={`w-full py-2 rounded-lg text-sm font-medium transition border-2 ${
                modoClick
                  ? "bg-blue-600 text-white border-blue-600"
                  : pedido.lat
                  ? "bg-green-50 text-green-700 border-green-400"
                  : "bg-white text-blue-600 border-blue-400 hover:bg-blue-50"
              }`}
            >
              {modoClick
                ? "🖱️ Click en el mapa..."
                : pedido.lat
                ? `📍 Ubicación marcada ✓`
                : "📍 Marcar en el mapa"}
            </button>

            {pedido.lat && (
              <p className="text-xs text-gray-400 text-center">
                {pedido.lat.toFixed(5)}, {pedido.lng.toFixed(5)}
              </p>
            )}

            <button
              onClick={buscarCercano}
              disabled={!pedido.lat}
              className="w-full bg-blue-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition disabled:opacity-40"
            >
              Buscar chofer cercano
            </button>

            {cercano && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <p className="text-sm font-semibold text-green-800">
                  Sugerido: {cercano.nombre || cercano.id}
                </p>
                <p className="text-xs text-green-600">
                  Placa: {cercano.placa || "—"} — {cercano.distancia.toFixed(2)} km
                </p>
                <button
                  onClick={asignarViaje}
                  disabled={guardando}
                  className="mt-2 w-full bg-green-600 text-white py-1.5 rounded-lg text-sm font-medium hover:bg-green-700 transition disabled:opacity-50"
                >
                  {guardando ? "Asignando..." : "Confirmar asignación"}
                </button>
              </div>
            )}

            {mensaje && (
              <p className="text-sm text-center text-gray-600">{mensaje}</p>
            )}
          </div>
        </div>
      </div>

      <div className="mt-4 flex gap-3 text-xs text-gray-400 items-center">
        <span>🟢 Libre</span>
        <span>🔴 Ocupado</span>
        <span>🔵 Cliente</span>
      </div>

      {/* Registro de viajes del día */}
      {/* Registro de viajes */}
      <div className="mt-8">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-gray-800">Viajes del día</h3>
          <div className="flex gap-2">
            <span className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-medium">
              🚗 En curso: {viajes.filter(v => v.estado === "EN_CURSO").length}
            </span>
            <span className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full font-medium">
              ✅ Completados: {viajes.filter(v => v.estado === "COMPLETADO").length}
            </span>
          </div>
        </div>

        {viajes.length === 0 ? (
          <p className="text-gray-400 text-sm">No hay viajes registrados hoy.</p>
        ) : (
          <div className="space-y-3">
            {viajes.map((viaje) => (
              <div
                key={viaje.id}
                className="bg-white rounded-xl shadow p-4 flex flex-col md:flex-row md:items-center justify-between gap-3"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-3 h-3 rounded-full flex-shrink-0 ${
                    viaje.estado === "COMPLETADO" ? "bg-green-500" : "bg-blue-500"
                  }`} />
                  <div>
                    <p className="text-sm font-bold text-gray-800">
                      {viaje.choferNombre}
                      <span className="text-gray-400 font-normal ml-2">
                        {viaje.choferPlaca}
                      </span>
                    </p>
                    <p className="text-sm text-gray-500 mt-0.5">
                      📍 {viaje.direccionCliente}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      Distancia estimada: {viaje.distanciaKm} km
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 flex-shrink-0">
                  <span className={`text-xs px-3 py-1.5 rounded-full font-medium ${
                    viaje.estado === "COMPLETADO"
                      ? "bg-green-100 text-green-800"
                      : "bg-blue-100 text-blue-800"
                  }`}>
                    {viaje.estado === "COMPLETADO" ? "✅ Completado" : "🚗 En curso"}
                  </span>
                  
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}