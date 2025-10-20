import { createContext, useContext, ReactNode, useState, useEffect } from 'react';

export interface UserData {
  id: number;
  username: string;
  email: string;
  roles: string[];
}

interface AuthContextType {
  token: string | null;
  user: UserData | null;
  login: (token: string, userData: UserData) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('token');
  });

  const [user, setUser] = useState<UserData | null>(() => {
    const storedUser = localStorage.getItem('user');
    return storedUser ? JSON.parse(storedUser) : null;
  });

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    if (storedToken) {
      setToken(storedToken);
    }
    
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const login = (newToken: string, userData: UserData) => {
    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(userData));
    setToken(newToken);
    setUser(userData);
    console.log('✅ Usuario autenticado:', userData.username);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    console.log('👋 Sesión cerrada');
  };

  const value = {
    token,
    user,
    login,
    logout,
    isAuthenticated: !!token,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider');
  }
  return context;
};
