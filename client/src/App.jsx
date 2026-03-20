import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Chat from './pages/Chat';
import Starfield from './components/Starfield';
import BootSequence from './components/BootSequence';
import { PersonaProvider } from './context/PersonaContext';

// Protects routes — redirects to login if not authenticated
const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  return user ? children : <Navigate to="/login" />;
};

function AppRoutes() {
  const { user } = useAuth();
  const [booting, setBooting] = useState(false);
  const [bootDone, setBootDone] = useState(false);

  useEffect(() => {
    if (user && !sessionStorage.getItem('booted')) {
      setBootDone(false);
      setBooting(true);
    } else {
      setBooting(false);
      setBootDone(true);
    }
  }, [user]);

  const handleBootComplete = () => {
    sessionStorage.setItem('booted', 'true');
    setBooting(false);
    setBootDone(true);
  };

  return (
    <>
      {booting && <BootSequence onComplete={handleBootComplete} />}

      <div style={{
        opacity: bootDone ? 1 : 0,
        transition: 'opacity 0.6s ease',
        height: '100vh'
      }}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/chat" element={<PrivateRoute><Chat /></PrivateRoute>} />
          <Route path="/" element={<Navigate to="/chat" />} />
        </Routes>
      </div>
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <PersonaProvider>
        <BrowserRouter>
          <Starfield />
          <div className="vignette" />
          <AppRoutes />
        </BrowserRouter>
      </PersonaProvider>
    </AuthProvider>
  );
}