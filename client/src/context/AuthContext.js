import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [chargement, setChargement] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      api.get('/auth/moi')
        .then(res => setUser(res.data.user))
        .catch(() => localStorage.removeItem('token'))
        .finally(() => setChargement(false));
    } else {
      setChargement(false);
    }
  }, []);

  const connexion = async (email, motDePasse) => {
    const res = await api.post('/auth/connexion', { email, motDePasse });
    localStorage.setItem('token', res.data.token);
    setUser(res.data.user);
    return res.data.user;
  };

  const inscriptionUser = async (data) => {
    const res = await api.post('/auth/inscription/user', data);
    localStorage.setItem('token', res.data.token);
    setUser(res.data.user);
    return res.data;
  };

  const inscriptionAgence = async (data) => {
    const res = await api.post('/auth/inscription/agence', data);
    localStorage.setItem('token', res.data.token);
    setUser(res.data.user);
    return res.data;
  };

  const deconnexion = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  const rafraichirUser = async () => {
    const res = await api.get('/auth/moi');
    setUser(res.data.user);
    return res.data.user;
  };

  return (
    <AuthContext.Provider value={{ user, chargement, connexion, inscriptionUser, inscriptionAgence, deconnexion, rafraichirUser, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
