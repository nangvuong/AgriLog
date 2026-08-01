import React, { createContext, useContext, useEffect, useState } from 'react';
import type { AuthResponse, UserProfile, VaiTroNguoiDung } from 'agrilog-shared';

interface AuthContextType {
  user: UserProfile | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (res: AuthResponse) => void;
  logout: () => void;
  updateUser: (updatedUser: UserProfile) => void;
  hasRole: (roles: VaiTroNguoiDung | VaiTroNguoiDung[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const savedToken = localStorage.getItem('agrilog_token');
    const savedUserJson = localStorage.getItem('agrilog_user');
    if (savedToken && savedUserJson) {
      try {
        const userObj = JSON.parse(savedUserJson) as UserProfile;
        setToken(savedToken);
        setUser(userObj);
      } catch (e) {
        localStorage.removeItem('agrilog_token');
        localStorage.removeItem('agrilog_user');
      }
    }
    setLoading(false);
  }, []);

  const login = (res: AuthResponse) => {
    setToken(res.access_token);
    setUser(res.user);
    localStorage.setItem('agrilog_token', res.access_token);
    localStorage.setItem('agrilog_user', JSON.stringify(res.user));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('agrilog_token');
    localStorage.removeItem('agrilog_user');
  };

  const updateUser = (updatedUser: UserProfile) => {
    setUser(updatedUser);
    localStorage.setItem('agrilog_user', JSON.stringify(updatedUser));
  };

  const hasRole = (roles: VaiTroNguoiDung | VaiTroNguoiDung[]): boolean => {
    if (!user) return false;
    if (Array.isArray(roles)) {
      return roles.includes(user.vai_tro);
    }
    return user.vai_tro === roles;
  };

  if (loading) {
    return null; // Hoặc một loading spinner cơ bản trong quá trình đồng bộ state ban đầu
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        login,
        logout,
        updateUser,
        hasRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
