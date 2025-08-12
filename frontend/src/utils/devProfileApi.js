// src/utils/api.js
import axios from "axios";

export const getDeveloperProfile = async (id, token) => {
  try {
    const res = await axios.get(`http://localhost:8000/api/v1/getdevprofile/${id}`, {
      headers: {
        authorization: `Bearer ${token}`,
      },
    });
    console.log("user in utils=>",res.data.user);
    return res.data?.user;
  } catch (error) {
    console.error("Error fetching dev profile:", error);
    throw error;
  }
};
