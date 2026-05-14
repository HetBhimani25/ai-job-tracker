import { createContext, useContext, useState, useEffect } from 'react';
import { getProfile } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user,   setUser]   = useState(null);
  const [token,  setToken]  = useState(localStorage.getItem('token'));
  const [skills, setSkills] = useState('');

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser && token) {
      setUser(JSON.parse(savedUser));
      fetchProfile();
    }
  }, [token]);

  const fetchProfile = async () => {
    try {
      const { data } = await getProfile();
      setSkills(data.skills || '');
    } catch {}
  };

  const loginUser = (userData, tokenData) => {
    setUser(userData);
    setToken(tokenData);
    localStorage.setItem('token', tokenData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const logoutUser = () => {
    setUser(null);
    setToken(null);
    setSkills('');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  const updateSkills = (newSkills) => setSkills(newSkills);

  return (
    <AuthContext.Provider value={{ user, token, skills, loginUser, logoutUser, updateSkills }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);