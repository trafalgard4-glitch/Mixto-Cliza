import { db } from "./config";
import {
  collection, addDoc, getDocs, updateDoc,
  doc, query, orderBy, serverTimestamp,
} from "firebase/firestore";
import { actualizarEstadoChofer } from "./choferes";

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

export async function actualizarEstado(id, estado, choferAsignadoId) {
  const ref = doc(db, "encomiendas", id);
  await updateDoc(ref, {
    estado,
    ...(estado === "ENTREGADO" ? { fechaEntrega: serverTimestamp() } : {}),
  });

  // Si sale en ruta → chofer pasa a NO_DISPONIBLE
  if (estado === "EN_RUTA" && choferAsignadoId) {
    await actualizarEstadoChofer(choferAsignadoId, "NO_DISPONIBLE");
  }

  // Si se entrega → chofer vuelve a estar DISPONIBLE al final de la cola
  if (estado === "ENTREGADO" && choferAsignadoId) {
    await actualizarEstadoChofer(choferAsignadoId, "DISPONIBLE");
  }
}