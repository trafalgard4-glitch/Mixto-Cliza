import { db } from "./config";
import {
  collection, addDoc, getDocs, updateDoc,
  doc, query, orderBy, serverTimestamp, where, getDoc
} from "firebase/firestore";

// ═══════════════════════════════
// SOCIOS
// ═══════════════════════════════

export async function obtenerSocios() {
  const q = query(collection(db, "socios"), orderBy("nombre"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function obtenerSocio(id) {
  const snap = await getDoc(doc(db, "socios", id));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() };
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
// FLUJO FINANCIERO DEL SOCIO
// ═══════════════════════════════

export async function obtenerMovimientosSocio(socioId) {
  const q = query(
    collection(db, "movimientosSocio"),
    where("socioId", "==", socioId),
    orderBy("fecha", "desc")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function registrarMovimientoSocio(datos) {
  await addDoc(collection(db, "movimientosSocio"), {
    ...datos,
    fecha: serverTimestamp(),
  });
}

// ═══════════════════════════════
// CAJA
// ═══════════════════════════════

export async function obtenerMovimientosCaja(categoria) {
  let q;
  if (categoria) {
    q = query(
      collection(db, "caja"),
      where("categoria", "==", categoria),
      orderBy("fecha", "desc")
    );
  } else {
    q = query(collection(db, "caja"), orderBy("fecha", "desc"));
  }
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function registrarMovimientoCaja(datos) {
  await addDoc(collection(db, "caja"), {
    ...datos,
    fecha: serverTimestamp(),
  });
}