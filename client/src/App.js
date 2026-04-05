import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import ListingDetail from './pages/ListingDetail';
import Login from './pages/Login';
import Register from './pages/Register';
import RegisterUser from './pages/RegisterUser';
import RegisterAgency from './pages/RegisterAgency';
import Dashboard from './pages/Dashboard';
import CreateListing from './pages/CreateListing';
import EditListing from './pages/EditListing';
import AdminDashboard from './pages/AdminDashboard';
import Pricing from './pages/Pricing';
import PaymentPage from './pages/PaymentPage';

// Bloque les agences non validées
const AgenceGate = ({ children }) => {
  const { user } = useAuth();
  if (user?.role === 'agency' && !user?.agence?.valide) {
    return <Navigate to="/tableau-de-bord" />;
  }
  return children;
};

const PrivateRoute = ({ children, roles }) => {
  const { user, chargement } = useAuth();
  if (chargement) return <div className="spinner-wrap"><div className="spinner"></div></div>;
  if (!user) return <Navigate to="/connexion" />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" />;
  return children;
};

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/annonce/:id" element={<ListingDetail />} />
          <Route path="/connexion" element={<Login />} />
          <Route path="/inscription" element={<Register />} />
          <Route path="/inscription/particulier" element={<RegisterUser />} />
          <Route path="/inscription/agence" element={<RegisterAgency />} />
          <Route path="/tableau-de-bord" element={
            <PrivateRoute roles={['user', 'agency', 'admin']}>
              <Dashboard />
            </PrivateRoute>
          } />
          <Route path="/nouvelle-annonce" element={
            <PrivateRoute roles={['user', 'agency', 'admin']}>
              <AgenceGate><CreateListing /></AgenceGate>
            </PrivateRoute>
          } />
          <Route path="/modifier-annonce/:id" element={
            <PrivateRoute roles={['user', 'agency', 'admin']}>
              <EditListing />
            </PrivateRoute>
          } />
          <Route path="/admin" element={
            <PrivateRoute roles={['admin']}>
              <AdminDashboard />
            </PrivateRoute>
          } />
          <Route path="/tarifs" element={<Pricing />} />
          <Route path="/paiement/:planId" element={
            <PrivateRoute roles={['agency']}>
              <PaymentPage />
            </PrivateRoute>
          } />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
      <Footer />
    </BrowserRouter>
  );
}
