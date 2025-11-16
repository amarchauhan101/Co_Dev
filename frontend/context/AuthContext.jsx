import { createContext, useContext, useEffect, useState } from "react";

const Authcontext = createContext();
export const useAuth = () => useContext(Authcontext);

// Helper function to check if token is expired
const isTokenExpired = (token) => {
  if (!token) return true;
  
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const currentTime = Date.now() / 1000;
    return payload.exp < currentTime;
  } catch (error) {
    console.error("Error parsing token:", error);
    return true;
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setuser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Function to refresh access token using refresh token
  const refreshAccessToken = async (refreshToken) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_REACT_APP_BACKEND_BASE_URL}/api/v1/refresh-token`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ refreshToken }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log("Token refreshed successfully:", data);
        
        // Update user data with new token
        setuser(data.userWithToken);
        localStorage.setItem("user", JSON.stringify(data.userWithToken));
        
        return data.userWithToken;
      } else {
        console.error("Failed to refresh token");
        // If refresh fails, logout user
        logout();
        return null;
      }
    } catch (error) {
      console.error("Error refreshing token:", error);
      logout();
      return null;
    }
  };

  useEffect(() => {
    const loaduser = async () => {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          
          // Check if access token is expired
          if (isTokenExpired(parsedUser.userWithToken?.token)) {
            console.log("Access token expired, attempting to refresh...");
            
            // Try to refresh using refresh token
            if (parsedUser.userWithToken?.refreshToken && !isTokenExpired(parsedUser.userWithToken.refreshToken)) {
              const refreshedUser = await refreshAccessToken(parsedUser.userWithToken.refreshToken);
              if (refreshedUser) {
                console.log("User session restored successfully");
              }
            } else {
              console.log("Refresh token also expired, logging out");
              logout();
            }
          } else {
            // Token is still valid
            setuser(parsedUser);
            console.log("User session loaded from storage");
          }
        } catch (error) {
          console.error("Error parsing user from localStorage:", error);
          logout();
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
      // Import api here to avoid circular dependency
      const { default: api } = await import("../src/utils/axiosConfig.js");
      
      const response = await api.get("/getprofile");
      
      if (response.status === 200) {
        const data = response.data;
        console.log("Refreshed user data:", data);
        
        // Update the user context with fresh data
        const updatedUser = {
          ...user,
          userWithToken: {
            ...user.userWithToken,
            ...data.userdata // Merge fresh user data
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
    <Authcontext.Provider value={{ user, login, logout, loading, refreshUser, refreshAccessToken }}>
      {children}
    </Authcontext.Provider>
  );
};
