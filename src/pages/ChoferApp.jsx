import { useState, useEffect, useRef } from "react";
import { actualizarUbicacionChofer } from "../firebase/radioTaxi";
import { ref, onValue, off, set } from "firebase/database";
import { rtdb, db } from "../firebase/config";
import { collection, query, where, getDocs, updateDoc, doc, serverTimestamp } from "firebase/firestore";

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
  const [viaje, setViaje] = useState(null);
  const intervalRef = useRef(null);

  // Escucha notificaciones de viaje asignado
  useEffect(() => {
    if (!choferId) return;
    const notifRef = ref(rtdb, `notificaciones/${choferId}`);
    onValue(notifRef, (snap) => {
      const data = snap.val();
      if (data && data.estado === "NUEVO_VIAJE") {
        setViaje(data);
        setEstado("OCUPADO");
      }
    });
    return () => off(notifRef);
  }, [choferId]);

  // Envía GPS cada 10 segundos
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

  const abrirGoogleMaps = () => {
    if (!viaje?.lat || !viaje?.lng) return;
    const url = `https://www.google.com/maps/dir/?api=1&destination=${viaje.lat},${viaje.lng}&travelmode=driving`;
    window.open(url, "_blank");
  };

  const abrirWaze = () => {
    if (!viaje?.lat || !viaje?.lng) return;
    const url = `https://waze.com/ul?ll=${viaje.lat},${viaje.lng}&navigate=yes`;
    window.open(url, "_blank");
  };

  const finalizarViaje = async () => {
    // Busca el viaje EN_CURSO de este chofer y lo marca completado
    const viajesSnap = await getDocs(
      query(
        collection(db, "viajes"),
        where("choferId", "==", choferId),
        where("estado", "==", "EN_CURSO")
      )
    );

    for (const documento of viajesSnap.docs) {
      await updateDoc(doc(db, "viajes", documento.id), {
        estado: "COMPLETADO",
        fechaCompletado: serverTimestamp()
      });
    }

    // Limpia la notificación
    const notifRef = ref(rtdb, `notificaciones/${choferId}`);
    await set(notifRef, null);
    setViaje(null);
    cambiarEstado("LIBRE");
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-sm text-center">
        <h1 className="text-xl font-bold text-gray-800 mb-1">Mixto Cliza</h1>
        <p className="text-sm text-gray-400 mb-6">Radio Taxi</p>

        {/* Notificación de viaje nuevo */}
        {viaje && (
          <div className="bg-blue-50 border-2 border-blue-400 rounded-xl p-4 mb-6 text-left">
            <p className="text-sm font-bold text-blue-800 mb-1">
              🚨 Viaje asignado
            </p>
            <p className="text-xs text-blue-700 mb-3">
              📍 {viaje.direccion}
            </p>
            <div className="flex gap-2 mb-2">
              <button
                onClick={abrirGoogleMaps}
                className="flex-1 bg-blue-600 text-white py-2 rounded-lg text-xs font-bold hover:bg-blue-700 transition"
              >
                🗺️ Google Maps
              </button>
              <button
                onClick={abrirWaze}
                className="flex-1 bg-cyan-500 text-white py-2 rounded-lg text-xs font-bold hover:bg-cyan-600 transition"
              >
                🚗 Waze
              </button>
            </div>
            <button
              onClick={finalizarViaje}
              className="w-full bg-green-500 text-white py-2 rounded-lg text-xs font-bold hover:bg-green-600 transition"
            >
              ✅ Viaje completado
            </button>
          </div>
        )}

        <div className="text-5xl mb-4">
          {estado === "LIBRE" ? "🟢" : "🔴"}
        </div>

        <p className="text-2xl font-bold mb-2 text-gray-700">
          {estado === "LIBRE" ? "LIBRE" : "OCUPADO"}
        </p>

        <p className="text-xs text-gray-400 mb-6">
          {enviando ? "Enviando ubicación..." :
            coordenadas ? "GPS activo ✓" : "Obteniendo GPS..."}
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