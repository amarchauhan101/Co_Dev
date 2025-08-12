import React from "react";
import { useAuth } from "../../context/AuthContext";
import { Navigate } from "react-router-dom";
import Loader from "../components/Loader";

function PrivateRoute({ children }) {
  const { user, loading } = useAuth();
  console.log("user in private route", user?.userWithToken?.token);

  if (loading) {
    return <div><Loader/></div>; // You can customize this
  }

  if (user && user?.userWithToken?.token) {
    return children;
  }

  return <Navigate to="/login" replace />;
}

export default PrivateRoute;
