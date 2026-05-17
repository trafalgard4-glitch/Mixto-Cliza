import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { escucharTaxis, registrarViaje, encontrarChoferCercano } from "../firebase/radioTaxi";
import { obtenerChoferes } from "../firebase/choferes";

// Icono verde para chofer libre
const iconoLibre = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34],
});

// Icono rojo para chofer ocupado
const iconoOcupado = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34],
});

// Coordenadas de Cliza, Bolivia
const CENTRO_CLIZA = [-17.5982, -65.9317];

export default function RadioTaxi() {
  const [taxis, setTaxis] = useState({});
  const [choferes, setChoferes] = useState([]);
  const [pedido, setPedido] = useState({ direccion: "", lat: "", lng: "" });
  const [cercano, setCercano] = useState(null);
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState("");

  useEffect(() => {
    obtenerChoferes().then(setChoferes);
    const unsub = escucharTaxis(setTaxis);
    return () => unsub();
  }, []);

  const libres = Object.values(taxis).filter((t) => t.estado === "LIBRE").length;
  const ocupados = Object.values(taxis).filter((t) => t.estado === "OCUPADO").length;

  const buscarCercano = () => {
    if (!pedido.lat || !pedido.lng) {
      alert("Ingresa las coordenadas del cliente");
      return;
    }
    const resultado = encontrarChoferCercano(
      taxis, choferes,
      parseFloat(pedido.lat),
      parseFloat(pedido.lng)
    );
    setCercano(resultado);
    if (!resultado) setMensaje("No hay choferes libres disponibles");
    else setMensaje("");
  };

  const asignarViaje = async () => {
    if (!cercano) return;
    setGuardando(true);
    await registrarViaje({
      choferId: cercano.id,
      choferNombre: cercano.nombre || "Sin nombre",
      choferPlaca: cercano.placa || "",
      direccionCliente: pedido.direccion,
      distanciaKm: cercano.distancia.toFixed(2),
    });
    setMensaje(`✅ Viaje asignado a ${cercano.nombre || cercano.id}`);
    setCercano(null);
    setPedido({ direccion: "", lat: "", lng: "" });
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
        <div className="lg:col-span-2 bg-white rounded-xl shadow overflow-hidden" style={{ height: "400px" }}>
          <MapContainer center={CENTRO_CLIZA} zoom={14} style={{ height: "100%", width: "100%" }}>
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
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
          </MapContainer>
        </div>

        <div className="bg-white rounded-xl shadow p-4">
          <h3 className="font-semibold text-gray-700 mb-3">Nuevo pedido</h3>
          <div className="space-y-3">
            <div>
              <label className="text-xs text-gray-500">Dirección del cliente</label>
              <input
                value={pedido.direccion}
                onChange={(e) => setPedido({ ...pedido, direccion: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 text-sm mt-1 focus:outline-none focus:ring-2 focus:ring-blue-400"
                placeholder="Av. Heroínas esq. San Martín"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs text-gray-500">Latitud</label>
                <input
                  value={pedido.lat}
                  onChange={(e) => setPedido({ ...pedido, lat: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 text-sm mt-1 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  placeholder="-17.598"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500">Longitud</label>
                <input
                  value={pedido.lng}
                  onChange={(e) => setPedido({ ...pedido, lng: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 text-sm mt-1 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  placeholder="-65.931"
                />
              </div>
            </div>

            <button
              onClick={buscarCercano}
              className="w-full bg-blue-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition"
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
    </div>
  );
}