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

export async function registrarEncomienda(datos) {
  const ref = collection(db, "encomiendas");
  const docRef = await addDoc(ref, {
    ...datos,
    estado: "EN_OFICINA",
    fechaRegistro: serverTimestamp(),
    fechaEntrega: null,
  });
  return docRef.id;
}

export async function obtenerEncomiendas() {
  const q = query(
    collection(db, "encomiendas"),
    orderBy("fechaRegistro", "desc")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function actualizarEstado(id, estado) {
  const ref = doc(db, "encomiendas", id);
  await updateDoc(ref, {
    estado,
    ...(estado === "ENTREGADO" ? { fechaEntrega: serverTimestamp() } : {}),
  });
}