import { db } from "./config";
import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  doc,
  query,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";

export async function obtenerChoferes() {
  const q = query(collection(db, "choferes"), orderBy("posicionCola"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function agregarChofer(datos) {
  const choferes = await obtenerChoferes();
  const ref = collection(db, "choferes");
  await addDoc(ref, {
    ...datos,
    estado: "DISPONIBLE",
    posicionCola: choferes.length + 1,
    fechaIngreso: serverTimestamp(),
  });
}

export async function actualizarEstadoChofer(id, estado) {
  const ref = doc(db, "choferes", id);
  await updateDoc(ref, { estado });
}