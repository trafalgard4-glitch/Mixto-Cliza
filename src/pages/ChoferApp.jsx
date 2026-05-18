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
  const [pulsando, setPulsando] = useState(false);
  const intervalRef = useRef(null);

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
      await actualizarUbicacionChofer(choferId, coordenadas.lat, coordenadas.lng, nuevoEstado);
    }
  };

  const abrirGoogleMaps = () => {
    if (!viaje?.lat || !viaje?.lng) return;
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${viaje.lat},${viaje.lng}&travelmode=driving`, "_blank");
  };

  const abrirWaze = () => {
    if (!viaje?.lat || !viaje?.lng) return;
    window.open(`https://waze.com/ul?ll=${viaje.lat},${viaje.lng}&navigate=yes`, "_blank");
  };

  const finalizarViaje = async () => {
    setPulsando(true);
    const viajesSnap = await getDocs(
      query(collection(db, "viajes"),
        where("choferId", "==", choferId),
        where("estado", "==", "EN_CURSO"))
    );
    for (const documento of viajesSnap.docs) {
      await updateDoc(doc(db, "viajes", documento.id), {
        estado: "COMPLETADO",
        fechaCompletado: serverTimestamp()
      });
    }
    const notifRef = ref(rtdb, `notificaciones/${choferId}`);
    await set(notifRef, null);
    setViaje(null);
    cambiarEstado("LIBRE");
    setPulsando(false);
  };

  const esLibre = estado === "LIBRE";

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ backgroundColor: "#f3f4f6" }}
    >
      {/* Navbar */}
      <nav style={{ backgroundColor: "#157f3c" }}>
        <div className="px-4 flex items-center h-16 gap-3">
          <img
            src="/images/LogoMC.png"
            alt="Mixto Cliza"
            className="w-20 h-20 object-contain flex-shrink-0 -my-2"
          />
          <div>
            <h1 className="text-white font-bold text-base leading-none">Mixto Cliza</h1>
            <p className="text-xs leading-none mt-0.5" style={{ color: "#a7f3d0" }}>
              Radio Taxi · Panel del chofer
            </p>
          </div>
        </div>
      </nav>

      <div className="flex-1 flex flex-col items-center justify-center p-4">
        <div
          className="w-full max-w-sm rounded-3xl shadow-lg overflow-hidden"
          style={{ backgroundColor: "#ffffff", border: "1px solid #e5e7eb" }}
        >
          {/* Notificación de viaje */}
          {viaje && (
            <div style={{ backgroundColor: "#157f3c" }} className="p-5">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xl animate-bounce">🚨</span>
                <p className="text-white font-bold text-sm">Nuevo viaje asignado</p>
              </div>
              <div
                className="rounded-2xl p-3 mb-3"
                style={{ backgroundColor: "rgba(255,255,255,0.15)" }}
              >
                <p className="text-xs font-medium mb-0.5" style={{ color: "#a7f3d0" }}>
                  Destino
                </p>
                <p className="text-white font-semibold text-sm">📍 {viaje.direccion}</p>
              </div>
              <div className="flex gap-2 mb-2">
                <button
                  onClick={abrirGoogleMaps}
                  className="flex-1 py-2.5 rounded-xl text-xs font-bold text-white transition"
                  style={{ backgroundColor: "rgba(255,255,255,0.2)" }}
                >
                  🗺️ Google Maps
                </button>
                <button
                  onClick={abrirWaze}
                  className="flex-1 py-2.5 rounded-xl text-xs font-bold text-white transition"
                  style={{ backgroundColor: "rgba(255,255,255,0.2)" }}
                >
                  🚗 Waze
                </button>
              </div>
              <button
                onClick={finalizarViaje}
                disabled={pulsando}
                className="w-full py-3 rounded-xl text-sm font-bold transition-all"
                style={{ backgroundColor: "#52eba6", color: "#064e3b" }}
              >
                {pulsando ? "Finalizando..." : "✅ Viaje completado"}
              </button>
            </div>
          )}

          {/* Estado principal */}
          <div className="p-6 text-center">

            {/* Indicador grande */}
            <div
              className="w-32 h-32 rounded-full mx-auto flex items-center justify-center mb-4 transition-all shadow-lg"
              style={{
                backgroundColor: esLibre ? "#f0fdf4" : "#fef2f2",
                border: `4px solid ${esLibre ? "#86efac" : "#fca5a5"}`,
              }}
            >
              <div>
                <p className="text-4xl">{esLibre ? "🟢" : "🔴"}</p>
                <p
                  className="text-xs font-black mt-1 tracking-widest"
                  style={{ color: esLibre ? "#157f3c" : "#dc2626" }}
                >
                  {esLibre ? "LIBRE" : "OCUPADO"}
                </p>
              </div>
            </div>

            {/* GPS status */}
            <div
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium mb-6"
              style={{
                backgroundColor: coordenadas ? "#f0fdf4" : "#f9fafb",
                color: coordenadas ? "#157f3c" : "#9ca3af",
                border: `1px solid ${coordenadas ? "#86efac" : "#e5e7eb"}`,
              }}
            >
              <span
                className="w-1.5 h-1.5 rounded-full"
                style={{ backgroundColor: enviando ? "#f59e0b" : coordenadas ? "#22c55e" : "#9ca3af" }}
              />
              {enviando ? "Enviando ubicación..." : coordenadas ? "GPS activo ✓" : "Obteniendo GPS..."}
            </div>

            {/* Botones de estado */}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => cambiarEstado("LIBRE")}
                disabled={esLibre}
                className="py-4 rounded-2xl font-bold text-sm transition-all"
                style={{
                  backgroundColor: esLibre ? "#157f3c" : "#f0fdf4",
                  color: esLibre ? "#ffffff" : "#157f3c",
                  border: `2px solid ${esLibre ? "#157f3c" : "#86efac"}`,
                  opacity: esLibre ? 1 : 0.7,
                }}
              >
                🟢 LIBRE
              </button>
              <button
                onClick={() => cambiarEstado("OCUPADO")}
                disabled={!esLibre}
                className="py-4 rounded-2xl font-bold text-sm transition-all"
                style={{
                  backgroundColor: !esLibre ? "#dc2626" : "#fef2f2",
                  color: !esLibre ? "#ffffff" : "#dc2626",
                  border: `2px solid ${!esLibre ? "#dc2626" : "#fca5a5"}`,
                  opacity: !esLibre ? 1 : 0.7,
                }}
              >
                🔴 OCUPADO
              </button>
            </div>

            {coordenadas && (
              <p className="text-xs mt-4" style={{ color: "#d1d5db" }}>
                {coordenadas.lat.toFixed(5)}, {coordenadas.lng.toFixed(5)}
              </p>
            )}
          </div>

          {/* Footer */}
          <div
            className="px-6 py-3 text-center"
            style={{ backgroundColor: "#f9fafb", borderTop: "1px solid #f3f4f6" }}
          >
            <p className="text-xs" style={{ color: "#9ca3af" }}>
              🇧🇴 Mixto Cliza · Cliza, Cochabamba
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}