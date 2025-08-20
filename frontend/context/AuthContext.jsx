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

  // New function to refresh user data from server
  const refreshUser = async () => {
    if (!user?.userWithToken?.token) return;
    
    try {
      const response = await fetch("http://localhost:8000/api/v1/getprofile", {
        headers: { 
          authorization: `Bearer ${user.userWithToken.token}` 
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log("Refreshed user data:", data);
        
        // Update the user context with fresh data
        const updatedUser = {
          ...user,
          userWithToken: {
            ...user.userWithToken,
            ...data.data.user // Merge fresh user data
          }
        };
        
        setuser(updatedUser);
        localStorage.setItem("user", JSON.stringify(updatedUser));
        
        return updatedUser;
      } else {
        console.error("Failed to refresh user data");
        return null;
      }
    } catch (error) {
      console.error("Error refreshing user:", error);
      return null;
    }
  };

  return (
    <Authcontext.Provider value={{ user, login, logout, loading, refreshUser }}>
      {children}
    </Authcontext.Provider>
  );
};
