import React from "react";
import { useForm } from "react-hook-form";
import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { IoMdEyeOff } from "react-icons/io";
import { IoEye } from "react-icons/io5";
import Swal from "sweetalert2";

const Register = () => {
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm();
  const [username, setusername] = useState("");
  const [email, setemail] = useState("");
  const [ishide, setishide] = useState(true);
  const navigate = useNavigate();

  const onSubmit = async (data) => {
    console.log("Form Data Submitted:", data);

    const res = await axios
      .post("http://localhost:8000/api/v1/Register", data)
      .then((res) => {
        console.log("res=>", res);
        setusername(res.data.username);
        setemail(res.data.email);
        if (res.status == 200) {
          console.log("inside swalfire");
          Swal.fire({
            title: "Registered Successfully!!", 
            text: "Good Job!",
            icon: "success",
          });
          navigate("/login");
        }

        reset();
      })
      .catch((err) => {
        console.log("err=>", err);
        if (err.response.status == 400) {
          setError("email", {
            type: "manual",
            message: "Email already exists",
          });
          return;
        }
      });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-500 via-purple-400 to-pink-300 relative overflow-hidden">
      <div className="absolute inset-0 z-0 pointer-events-none">
        <svg width="100%" height="100%" viewBox="0 0 800 600" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="650" cy="100" r="120" fill="#fff" fillOpacity="0.08" />
          <circle cx="150" cy="500" r="100" fill="#fff" fillOpacity="0.10" />
          <ellipse cx="400" cy="300" rx="350" ry="180" fill="#fff" fillOpacity="0.07" />
        </svg>
      </div>
      <div className="w-full max-w-md p-8 rounded-3xl shadow-2xl bg-white/30 backdrop-blur-lg border border-white/40 relative z-10 animate-fade-in">
        <h1 className="text-4xl font-extrabold text-center text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-500 to-pink-400 mb-8 tracking-tight drop-shadow-lg">Create Your Account</h1>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label htmlFor="username" className="block text-base font-semibold text-indigo-700 mb-1">Username</label>
            <input
              type="text"
              id="username"
              {...register("username", { required: "Username is required" })}
              className="w-full px-4 py-3 rounded-xl border border-purple-300 bg-white/60 focus:ring-2 focus:ring-pink-400 focus:outline-none text-lg shadow-sm transition-all duration-200"
              placeholder="Enter your username"
            />
            {errors.username && (
              <p className="text-sm text-pink-600 mt-1">{errors.username.message}</p>
            )}
          </div>
          <div>
            <label htmlFor="email" className="block text-base font-semibold text-indigo-700 mb-1">Email</label>
            <input
              type="email"
              id="email"
              {...register("email", {
                required: "Email is required",
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: "Invalid email address",
                },
              })}
              className="w-full px-4 py-3 rounded-xl border border-purple-300 bg-white/60 focus:ring-2 focus:ring-pink-400 focus:outline-none text-lg shadow-sm transition-all duration-200"
              placeholder="Enter your email"
            />
            {errors.email && (
              <p className="text-sm text-pink-600 mt-1">{errors.email.message}</p>
            )}
          </div>
          <div>
            <label htmlFor="password" className="block text-base font-semibold text-indigo-700 mb-1">Password</label>
            <div className="flex items-center relative">
              <input
                type={`${ishide ? "password" : "text"}`}
                id="password"
                {...register("password", {
                  required: "Password is required",
                  minLength: {
                    value: 6,
                    message: "Password must be at least 6 characters",
                  },
                })}
                className="w-full px-4 py-3 rounded-xl border border-purple-300 bg-white/60 focus:ring-2 focus:ring-pink-400 focus:outline-none text-lg shadow-sm transition-all duration-200"
                placeholder="Enter your password"
              />
              <span
                onClick={() => setishide(!ishide)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-xl text-indigo-500 cursor-pointer"
              >
                {ishide ? <IoMdEyeOff /> : <IoEye />}
              </span>
            </div>
            {errors.password && (
              <p className="text-sm text-pink-600 mt-1">{errors.password.message}</p>
            )}
          </div>
          <button
            type="submit"
            className="w-full py-3 px-4 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-400 text-white font-bold rounded-xl shadow-lg hover:scale-105 hover:shadow-2xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-pink-400 focus:ring-offset-2"
          >
            Register
          </button>
        </form>
        <div className="mt-6 text-center">
          <span className="text-base text-indigo-700">Already have an account?</span>
          <a href="/login" className="ml-2 text-pink-500 font-semibold hover:underline transition-all">Login</a>
        </div>
      </div>
    </div>
  );
};

export default Register;
