import React, { useEffect, useState } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { IoClose } from "react-icons/io5";
import { useAuth } from "../../context/AuthContext";

const ProofForm = ({ taskId, onSuccess, getAllTask,projectId }) => {
  const [note, setNote] = useState("");
  const [zipFile, setZipFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const {user } = useAuth();
  const users = user?.userWithToken; // Get user data from context
  const token = users?.token; // Extract token from user data

  useEffect(() => {}, []);
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!zipFile) return alert("Please upload a .zip file");

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("file", zipFile);
      formData.append("upload_preset", "task_proof_files"); // 🔁 Must match your Cloudinary preset
      formData.append("folder", "taskProofs"); // (Optional) organize uploads

      const uploadRes = await axios.post(
        "https://api.cloudinary.com/v1_1/dslgrbcs5/raw/upload",
        formData
      );

      const fileUrl = uploadRes.data.secure_url;

      await axios.post(
        `http://localhost:8000/api/v1/task/${taskId}/proof`,
        { note, zipFile: fileUrl },
        {
          headers: {
            Authorization: `Bearer ${user?.token}`, // 🔁 Use the token from Redux store
          },
        }
      );

      alert("✅ Proof submitted!");
      setNote("");
      setZipFile(null);
      if (getAllTask) {
        getAllTask(projectId);
      }
      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      console.error("Upload error:", err);
      alert("❌ Error uploading proof. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="relative bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 p-6 rounded-2xl shadow-2xl text-white space-y-5 backdrop-blur-md"
    >
      <h2 className="text-lg font-semibold mb-2 text-emerald-400">
        📤 Submit Task Proof
      </h2>

      {/* Note Input */}
      <div className="space-y-1">
        <label
          htmlFor="note"
          className="block text-sm font-medium text-gray-300"
        >
          📝 What did you do?
        </label>
        <textarea
          id="note"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Explain your work here..."
          className="w-full p-3 rounded-xl bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
          rows={4}
          required
        />
      </div>

      {/* File Upload */}
      <div className="space-y-1">
        <label
          htmlFor="zipFile"
          className="block text-sm font-medium text-gray-300"
        >
          📎 Upload .zip file
        </label>
        <input
          id="zipFile"
          type="file"
          accept=".zip"
          onChange={(e) => setZipFile(e.target.files[0])}
          className="block w-full p-2 rounded-xl bg-gray-700 text-white border border-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:bg-emerald-600 file:text-white hover:file:bg-emerald-700"
          required
        />
      </div>

      {/* Buttons */}
      <div className="flex justify-between items-center pt-2">
        <button
          type="submit"
          disabled={loading}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2 rounded-xl text-sm font-semibold shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50"
        >
          {loading ? "⏳ Uploading..." : "✅ Submit Proof"}
        </button>

        <button
          type="button"
          onClick={() => {
            setNote("");
            setZipFile(null);
          }}
          className="text-red-400 hover:text-red-600 text-sm font-medium underline transition"
        >
          🔄 Reset
        </button>
      </div>
    </form>
  );
};

export default ProofForm;
