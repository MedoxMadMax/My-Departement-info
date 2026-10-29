import { createContext } from 'react';

const AuthContext = createContext({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
  login: async () => {},
  logout: () => {},
  hasRole: () => false,
});

export default AuthContext;
