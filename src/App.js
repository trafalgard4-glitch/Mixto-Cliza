import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "./firebase/config";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Rastreo from "./pages/Rastreo";
import ChoferApp from "./pages/ChoferApp";

function App() {
  const [usuario, setUsuario] = useState(null);
  const [cargando, setCargando] = useState(true);

  const esRastreo = window.location.pathname === "/rastreo";
const esChofer = window.location.pathname === "/chofer";

  useEffect(() => {
    if (esRastreo) {
      setCargando(false);
      return;
    }
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const docRef = doc(db, "usuarios", user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setUsuario({ email: user.email, ...docSnap.data() });
        } else {
          setUsuario({ email: user.email, rol: "chofer" });
        }
      } else {
        setUsuario(null);
      }
      setCargando(false);
    });
    return () => unsub();
  }, [esRastreo]);

  if (esRastreo) return <Rastreo />;
if (esChofer) return <ChoferApp />;

  if (cargando) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-400">Cargando...</p>
      </div>
    );
  }

  return usuario ? <Dashboard usuario={usuario} /> : <Login />;
}

export default App;