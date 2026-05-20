import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "./firebase/config";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Rastreo from "./pages/Rastreo";
import ChoferApp from "./pages/ChoferApp";
import Kardex from "./pages/Kardex";

function AppContent() {
  const [usuario, setUsuario] = useState(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
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
  }, []);

  if (cargando) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p style={{ color: "#9ca3af" }}>Cargando...</p>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/rastreo" element={<Rastreo />} />
      <Route path="/chofer" element={<ChoferApp />} />
      <Route path="/socio/:id" element={<Kardex />} />
      <Route path="*" element={
        usuario ? <Dashboard usuario={usuario} /> : <Login />
      } />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;