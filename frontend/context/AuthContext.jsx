import { createContext, useContext, useEffect, useState } from "react";

const Authcontext = createContext();
export const useAuth = () => useContext(Authcontext);

export const AuthProvider = ({ children }) => {
  const [user, setuser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loaduser = () => {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          setuser(parsedUser);
        } catch (error) {
          console.error("Error parsing user from localStorage:", error);
        }
      }
      setLoading(false);
    };
    loaduser();
  }, []);

  const login = (userData) => {
    setuser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
  };

  const logout = () => {
    setuser(null);
    localStorage.removeItem("user");
  };

  return (
    <Authcontext.Provider value={{ user, login, logout, loading }}>
      {children}
    </Authcontext.Provider>
  );
};
