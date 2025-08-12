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
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-blue-200">
      <div className="w-full max-w-md p-6 bg-white rounded-2xl shadow-lg ">
        <h1 className="text-2xl font-bold text-center text-blue-600 mb-6">
          Register
        </h1>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label
              htmlFor="username"
              className="block text-sm font-medium text-gray-700"
            >
              Username
            </label>
            <input
              type="text"
              id="username"
              {...register("username", { required: "Username is required" })}
              className="mt-1 block w-full p-2 outline-none rounded-lg border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter your username"
            />
            {errors.username && (
              <p className="text-sm text-red-500 mt-1">
                {errors.username.message}
              </p>
            )}
          </div>
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700"
            >
              Email
            </label>
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
              className="mt-1 block w-full p-2 outline-none rounded-lg border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter your email"
            />
            {errors.email && (
              <p className="text-sm text-red-500 mt-1">
                {errors.email.message}
              </p>
            )}
          </div>
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700"
            >
              Password
            </label>
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
                className="mt-1 block w-full rounded-lg p-2 outline-none border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter your password"
              />{" "}
              <span
                onClick={() => setishide(!ishide)}
                className="absolute inset-y-0 right-3 flex items-center"
              >
                {ishide ? <IoMdEyeOff /> : <IoEye />}
              </span>
            </div>
            {errors.password && (
              <p className="text-sm text-red-500 mt-1">
                {errors.password.message}
              </p>
            )}
          </div>
          <button
            type="submit"
            className="w-full py-2 px-4 bg-blue-600 text-white font-medium rounded-lg shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Register
          </button>
        </form>
      </div>
    </div>
  );
};

export default Register;
