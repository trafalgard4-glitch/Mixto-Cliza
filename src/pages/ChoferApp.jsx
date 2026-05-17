import { useState, useEffect, useRef } from "react";
import { actualizarUbicacionChofer } from "../firebase/radioTaxi";

export default function ChoferApp() {
  const [choferId] = useState(() => {
    const guardado = localStorage.getItem("choferId");
    if (guardado) return guardado;
    const nuevo = prompt("Ingresa tu ID de chofer:");
    if (nuevo) localStorage.setItem("choferId", nuevo);
    return nuevo;
  });

  const [estado, setEstado] = useState("LIBRE");
  const [coordenadas, setCoordenadas] = useState(null);
  const [enviando, setEnviando] = useState(false);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (!choferId) return;

    const enviarUbicacion = () => {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const { latitude, longitude } = pos.coords;
          setCoordenadas({ lat: latitude, lng: longitude });
          setEnviando(true);
          await actualizarUbicacionChofer(choferId, latitude, longitude, estado);
          setEnviando(false);
        },
        (err) => console.error("Error GPS:", err),
        { enableHighAccuracy: true }
      );
    };

    enviarUbicacion();
    intervalRef.current = setInterval(enviarUbicacion, 10000);
    return () => clearInterval(intervalRef.current);
  }, [choferId, estado]);

  const cambiarEstado = async (nuevoEstado) => {
    setEstado(nuevoEstado);
    if (coordenadas) {
      await actualizarUbicacionChofer(
        choferId, coordenadas.lat, coordenadas.lng, nuevoEstado
      );
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-sm text-center">
        <h1 className="text-xl font-bold text-gray-800 mb-1">Mixto Cliza</h1>
        <p className="text-sm text-gray-400 mb-6">Radio Taxi</p>

        <div className={`text-5xl mb-4`}>
          {estado === "LIBRE" ? "🟢" : "🔴"}
        </div>

        <p className="text-2xl font-bold mb-2 text-gray-700">
          {estado === "LIBRE" ? "LIBRE" : "OCUPADO"}
        </p>

        <p className="text-xs text-gray-400 mb-6">
          {enviando ? "Enviando ubicación..." :
            coordenadas
              ? `GPS activo ✓`
              : "Obteniendo GPS..."}
        </p>

        <div className="flex gap-3">
          <button
            onClick={() => cambiarEstado("LIBRE")}
            disabled={estado === "LIBRE"}
            className="flex-1 bg-green-500 text-white py-3 rounded-xl font-bold text-sm hover:bg-green-600 transition disabled:opacity-30"
          >
            LIBRE
          </button>
          <button
            onClick={() => cambiarEstado("OCUPADO")}
            disabled={estado === "OCUPADO"}
            className="flex-1 bg-red-500 text-white py-3 rounded-xl font-bold text-sm hover:bg-red-600 transition disabled:opacity-30"
          >
            OCUPADO
          </button>
        </div>

        {coordenadas && (
          <p className="text-xs text-gray-300 mt-4">
            {coordenadas.lat.toFixed(5)}, {coordenadas.lng.toFixed(5)}
          </p>
        )}
      </div>
    </div>
  );
}