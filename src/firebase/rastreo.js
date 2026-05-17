import { db } from "./config";
import { collection, query, where, getDocs } from "firebase/firestore";

export async function buscarEncomienda(codigo) {
  const q = query(
    collection(db, "encomiendas"),
    where("codigo", "==", codigo.toUpperCase().trim())
  );
  const snap = await getDocs(q);
  if (snap.empty) return null;
  return { id: snap.docs[0].id, ...snap.docs[0].data() };
}