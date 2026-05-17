import { db } from "./config";
import {
  collection, addDoc, getDocs, updateDoc,
  doc, query, orderBy, serverTimestamp, where
} from "firebase/firestore";

// ═══════════════════════════════
// SOCIOS
// ═══════════════════════════════

export async function obtenerSocios() {
  const q = query(collection(db, "socios"), orderBy("nombre"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function agregarSocio(datos) {
  await addDoc(collection(db, "socios"), {
    ...datos,
    estado: "activo",
    fechaIngreso: serverTimestamp(),
  });
}

export async function actualizarSocio(id, datos) {
  await updateDoc(doc(db, "socios", id), datos);
}

// ═══════════════════════════════
// CUOTAS
// ═══════════════════════════════

export async function obtenerCuotas(socioId) {
  const q = query(
    collection(db, "cuotas"),
    where("socioId", "==", socioId)
  );
  const snap = await getDocs(q);
  const cuotas = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  return cuotas.sort((a, b) => b.mes.localeCompare(a.mes));
}

export async function registrarCuota(datos) {
  await addDoc(collection(db, "cuotas"), {
    ...datos,
    fechaPago: serverTimestamp(),
  });
}

// ═══════════════════════════════
// CAJA
// ═══════════════════════════════

export async function obtenerMovimientosCaja() {
  const q = query(
    collection(db, "caja"),
    orderBy("fecha", "desc")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function registrarMovimientoCaja(datos) {
  await addDoc(collection(db, "caja"), {
    ...datos,
    fecha: serverTimestamp(),
  });
}