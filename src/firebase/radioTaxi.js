import { rtdb, db } from "./config";
import {
  ref, set, onValue, off
} from "firebase/database";
import {
  collection, addDoc, getDocs,
  query, orderBy, serverTimestamp, doc, updateDoc
} from "firebase/firestore";
import { calcularDistancia } from "../utils/calcularDistancia";

// Actualiza ubicación GPS del chofer en Realtime DB
export function actualizarUbicacionChofer(choferId, lat, lng, estado) {
  const r = ref(rtdb, `taxis/${choferId}`);
  return set(r, {
    lat,
    lng,
    estado,
    ultimaActualizacion: Date.now(),
  });
}

// Escucha en tiempo real todos los taxis
export function escucharTaxis(callback) {
  const r = ref(rtdb, "taxis");
  onValue(r, (snap) => {
    const data = snap.val() || {};
    callback(data);
  });
  return () => off(r);
}

// Registra un viaje nuevo
export async function registrarViaje(datos) {
  const ref2 = collection(db, "viajes");
  const docRef = await addDoc(ref2, {
    ...datos,
    estado: "EN_CURSO",
    fecha: serverTimestamp(),
  });
  return docRef.id;
}

// Obtiene viajes del día
export async function obtenerViajes() {
  const q = query(collection(db, "viajes"), orderBy("fecha", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

// Finaliza un viaje
export async function finalizarViaje(id) {
  const r = doc(db, "viajes", id);
  await updateDoc(r, { estado: "COMPLETADO" });
}

// Encuentra el chofer libre más cercano
export function encontrarChoferCercano(taxis, choferes, latCliente, lngCliente) {
  const libres = Object.entries(taxis)
    .filter(([, t]) => t.estado === "LIBRE")
    .map(([id, t]) => {
      const info = choferes.find((c) => c.id === id);
      const distancia = calcularDistancia(latCliente, lngCliente, t.lat, t.lng);
      return { id, ...t, ...info, distancia };
    })
    .sort((a, b) => a.distancia - b.distancia);
  return libres[0] || null;
}