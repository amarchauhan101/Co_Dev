import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Navigate, useNavigate } from "react-router-dom";
import Loader from "./Loader";
import { decodeJWT } from "../utils/decodeJWT";

function Protectedroute({ children }) {
  const [loading, setLoading] = useState(true);
  const user = useSelector((state) => state.userauth?.user);
  console.log("user in protectedroute",user);
  const navigate = useNavigate();

  useEffect(() => {
    const users = localStorage.getItem("user");
    const token = users?.userWithToken?.token;
    if (!token) {
      navigate("/login");
      return;
    }

    const decoded = decodeJWT(token);
    if (!decoded || Date.now() >= decoded.exp * 1000) {
      localStorage.removeItem("user");
      localStorage.removeItem("token")
      return;
    }

    setLoading(false);
  }, [user, navigate]);

  if (loading) return <Loader />;

  return <>{children}</>;
}

export default Protectedroute;
