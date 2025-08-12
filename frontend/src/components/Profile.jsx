import React, { useEffect, useState } from "react";
import axios from "axios";
import { useForm } from "react-hook-form";
import Loader from "./Loader";
import { FaBell, FaCode, FaDatabase, FaServer } from "react-icons/fa";
import { toast } from "react-toastify";
import { FaYoutube } from "react-icons/fa";
import { FaTwitter } from "react-icons/fa";
import { RiInstagramFill } from "react-icons/ri";
import { BsGithub } from "react-icons/bs";
import { FaLinkedin, FaPalette } from "react-icons/fa6";
import { AiFillInstagram } from "react-icons/ai";
import { FaFacebookF } from "react-icons/fa";
import { useSelector } from "react-redux";
import { Graph } from "./Graph";
import { BarChart, Cell, PieChart, ResponsiveContainer } from "recharts";
import { Bar, Pie } from "react-chartjs-2";
import ProfileDev from "./ProfileDev";
import ProjectsSection from "./ProjectSection";
import { IoSchool } from "react-icons/io5";
import {
  getSocialIcon,
  getInterestIcon,
  getSkillIcon,
} from "../utils/iconMapper";
import { useAuth } from "../../context/AuthContext";

function Profile() {
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const { user } = useAuth();
  const token = user?.userWithToken?.token;
  console.log("user in profile", user);

  const { register, handleSubmit, reset } = useForm();

  const sociallink = {
    youtube: <FaYoutube className="text-red-500" />,
    twitter: <FaTwitter className="text-blue-400" />,
    instagram: <RiInstagramFill className="text-pink-500" />,
    github: <BsGithub className="text-zinc-600" />,
    linkedin: <FaLinkedin className="text-blue-700" />,
  };
  //   // Chart colors
  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];
  const SKILL_COLORS = {
    Frontend: "#6366F1",
    Backend: "#10B981",
    Database: "#F59E0B",
    DevOps: "#EF4444",
  };

  //   // Skill icons
  const SkillIcon = ({ name }) => {
    const icons = {
      Frontend: <FaCode className="text-indigo-500" />,
      Backend: <FaServer className="text-emerald-500" />,
      Database: <FaDatabase className="text-amber-500" />,
      DevOps: <FaPalette className="text-red-500" />,
    };
    return icons[name] || <FaCode />;
  };

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get("http://localhost:8000/api/v1/getprofile", {
          headers: { authorization: `Bearer ${token}` },
        });
        console.log("res=>", res.data);
        const user = res.data.userdata;
        console.log("user profile", user);

        reset({
          ...user,
          profile: {
            ...user.profile,
            skills: user.profile?.skills?.join(", ") || "",
            social: user.profile?.social || {},
          },
        });

        setUserData(user);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching profile:", err);
        setLoading(false);
      }
    };
    fetchProfile();
  }, [token, reset]);

  const onSubmit = async (data) => {
    try {
      const res = await axios.put(
        "http://localhost:8000/api/v1/updateprofile",
        data,
        { headers: { authorization: `Bearer ${token}` } }
      );

      if (res.status === 200) {
        setUserData((prev) => ({
          ...prev,
          profile: {
            ...prev.profile,
            bio: data.bio || profile?.bio,
            skills: data.skills.split(",").map((s) => s.trim()),
            experience: data.experience || profile?.experience,
            education: data.education || profile?.education,
            social: {
              linkedin: data.social.linkedin || profile?.social?.linkedin,
              github: data.social.github || profile?.social?.github,
              instagram: data.social.instagram || profile?.social?.instagram,
              twitter: data.social.twitter || profile?.social?.twitter,
              youtube: data.social.youtube || profile?.social?.youtube,
            },
          },
        }));
        toast.success("Profile updated successfully");
        setIsEditing(false);
      }
    } catch (err) {
      console.error("Error updating profile:", err);
      toast.error("Failed to update profile");
    }
  };

  useEffect(() => {
    if (isEditing && userData?.profile) {
      reset({
        bio: userData.profile.bio || "",
        skills: userData.profile.skills?.join(", ") || "",
        experience: userData.profile.experience || "",
        education: userData.profile.education || "",
        social: {
          linkedin: userData.profile.social?.linkedin || "",
          github: userData.profile.social?.github || "",
          instagram: userData.profile.social?.instagram || "",
          twitter: userData.profile.social?.twitter || "",
          youtube: userData.profile.social?.youtube || "",
        },
      });
    }
  }, [isEditing, userData, reset]);

  // const handleRespond = async (requestId, response) => {
  //   try {
  //     const res = await axios.post(
  //       "http://localhost:8000/api/v1/request/respond",
  //       { requestId, response },
  //       { headers: { authorization: `Bearer ${token}` } }
  //     );

  //     if (res.status === 200) {
  //       toast.success(`Request ${response}`);
  //       setUserData((prev) => ({
  //         ...prev,
  //         profile: {
  //           ...prev.profile,
  //           requests: prev.profile.requests.filter((r) => r._id !== requestId),
  //         },
  //       }));
  //       if (userData.profile.requests.length === 1) setShowModal(false);
  //     }
  //   } catch (err) {
  //     toast.error(`Failed to ${response} request`);
  //   }
  // };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900 text-gray-200">
        <Loader />
      </div>
    );
  }

  const profile = userData?.profile;
  const social = profile?.social || {};

  const reliabilityData = {
    labels: ["Completed", "Remaining"],
    datasets: [
      {
        label: "Reliability",
        data: [profile?.reliabilityScore, 100 - profile?.reliabilityScore],
        backgroundColor: ["#10B981", "#374151"],
      },
    ],
  };

  const skillsData =
    profile?.skills?.map((skill) => ({
      name: skill,
      value: 1, // You can change value based on frequency or level if available
    })) || [];

  return (
    <div className="min-h-screen font-fira bg-gray-900 text-gray-200 py-8 px-4 flex flex-col items-center">
      {/* Header */}
      <div className="w-full flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-100">Your Profile</h1>
      </div>

      {/* Profile Card */}
      <div className="w-full  bg-gray-900 rounded-xl shadow-lg p-8 grid grid-cols-1 md:grid-cols-3 gap-8 text-white min-h-[calc(100vh-4rem)]">
        {/* Profile Info */}
        <div className="col-span-2 flex flex-col gap-10 font-[Poppins] text-slate-100 px-4 sm:px-6 md:px-10 xl:px-16">
          {/* Top Profile Section */}
          <div className="flex flex-col md:flex-row items-center md:items-start gap-8  p-6 md:p-10    backdrop-blur-md">
            {/* Avatar */}
            <div className="relative">
              <img
                src={userData?.profileImage}
                alt="Profile"
                className="w-28 h-28 sm:w-32 sm:h-32 md:w-36 md:h-36 rounded-full object-cover border-4 border-emerald-400 shadow-xl hover:scale-105 transition-transform duration-300"
              />
              {profile?.isactive && (
                <span className="absolute bottom-1 right-1 w-4 h-4 bg-green-400 border-2 border-white rounded-full ring-2 ring-emerald-400 animate-ping"></span>
              )}
            </div>

            {/* Basic Info */}
            <div className="flex-1 text-center md:text-left space-y-2">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-blue-400 to-purple-400 tracking-wide">
                {userData?.username}
              </h2>
              <p className="text-sm text-gray-400">{userData?.email}</p>
              <p className="italic text-gray-300">
                {profile?.bio || "No bio available"}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-sm mt-3">
                <p>
                  <span className="font-semibold text-emerald-400">
                    ⚙ Experience:
                  </span>{" "}
                  {profile?.experienceLevel || "Not specified"}
                </p>
                <p>
                  <span className="font-semibold text-emerald-400">
                    🐱‍💻 GitHub Commits:
                  </span>{" "}
                  {profile?.githubCommits ?? 0}
                </p>
                <p className="sm:col-span-2">
                  <span className="font-semibold text-emerald-400">
                    🟢 Active At:
                  </span>{" "}
                  {new Date(profile?.activeat).toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          {/* Edit Form */}
          {isEditing ? (
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="p-5 sm:p-8 md:p-10 bg-[#12141c] rounded-xl border border-slate-700 shadow-lg backdrop-blur-sm space-y-6"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <Input
                  label="📝 Bio"
                  type="textarea"
                  register={register("bio")}
                />
                <Input
                  label="💡 Skills"
                  register={register("skills")}
                  placeholder="e.g. React, Node.js"
                />
                <Input
                  label="💼 Experience"
                  register={register("experience")}
                />
                <Input label="🎓 Education" register={register("education")} />
              </div>

              <div className="space-y-2">
                <h3 className="text-white text-sm font-semibold">
                  🔗 Social Links
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    "linkedin",
                    "github",
                    "instagram",
                    "twitter",
                    "youtube",
                  ].map((key) => (
                    <input
                      key={key}
                      {...register(`social.${key}`)}
                      placeholder={`${key.charAt(0).toUpperCase()}${key.slice(
                        1
                      )} URL`}
                      className="w-full px-4 py-2 rounded-md bg-gray-800 text-gray-200 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-emerald-400 transition"
                    />
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-4 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="bg-gray-700 hover:bg-gray-600 text-white px-5 py-2 rounded-lg shadow transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-gradient-to-r from-emerald-500 to-blue-500 hover:from-emerald-400 hover:to-blue-400 text-white px-5 py-2 rounded-lg shadow-lg transition"
                >
                  💾 Save
                </button>
              </div>
            </form>
          ) : (
            <>
              {/* Education & Experience */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-4">
                <div>
                  <h4 className="text-lg font-semibold text-emerald-300 mb-1">
                    🎓 Education
                  </h4>
                  <p className="text-sm text-gray-300">
                    {profile?.education || "Not specified"}
                  </p>
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-emerald-300 mb-1">
                    💼 Experience
                  </h4>
                  <p className="text-sm text-gray-300">
                    {profile?.experience || "Not specified"}
                  </p>
                </div>
              </div>

              {/* Skills */}
              <div>
                <h4 className="text-lg font-semibold text-emerald-300 mb-2">
                  🛠 Skills
                </h4>
                <div className="flex flex-wrap gap-3">
                  {profile?.skills?.length ? (
                    profile.skills.map((skill, index) => {
                      const SkillIcon = getSkillIcon(skill);
                      return (
                        <span
                          key={index}
                          className="flex items-center gap-2 px-3 py-1 text-xs bg-gradient-to-r from-emerald-700 to-emerald-500 text-white rounded-full shadow hover:scale-105 transition"
                        >
                          <SkillIcon className="text-sm" />
                          {skill}
                        </span>
                      );
                    })
                  ) : (
                    <p className="text-sm text-gray-400">Not specified</p>
                  )}
                </div>
              </div>

              {/* Interests */}
              <div>
                <h4 className="text-lg font-semibold text-blue-300 mb-2">
                  🎯 Interests
                </h4>
                <div className="flex flex-wrap gap-2">
                  {profile?.interests?.length ? (
                    profile.interests.map((interest, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 text-xs bg-blue-700 text-white rounded-full shadow hover:bg-blue-500 transition"
                      >
                        {interest}
                      </span>
                    ))
                  ) : (
                    <p className="text-sm text-gray-400">Not specified</p>
                  )}
                </div>
              </div>

              {/* Social Links */}
              <div>
                <h4 className="text-lg font-semibold text-white mb-2">
                  🌐 Social Profiles
                </h4>
                <div className="flex flex-wrap gap-3">
                  {Object.entries(profile?.social || {}).map(([key, value]) => {
                    const Icon = getSocialIcon(key);
                    return (
                      <a
                        key={key}
                        href={value}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-2 px-3 py-1 text-xs bg-gray-800 hover:bg-emerald-600 rounded-full capitalize text-white transition"
                      >
                        <Icon className="text-sm" />
                        {key}
                      </a>
                    );
                  })}
                </div>
              </div>

              {/* Edit Button */}
              <div className="flex justify-end mt-8">
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-5 py-2 bg-gradient-to-r from-purple-600 to-emerald-500 hover:from-purple-500 hover:to-emerald-400 text-white rounded-full shadow-md hover:shadow-emerald-400 transition"
                >
                  ✏️ Edit Profile
                </button>
              </div>
            </>
          )}
        </div>

        {/* Right Column - Developer Analytics */}
        <div className="col-span-1 overflow-auto max-h-[calc(100vh-8rem)]">
          <ProfileDev profile={profile} />
        </div>
      </div>

      {/* Notification Modal */}
      {/* {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded-lg w-full max-w-lg relative">
            <button
              className="absolute top-2 right-4 text-white text-xl"
              onClick={() => setShowModal(false)}
            >
              ×
            </button>
            <h2 className="text-white text-xl font-bold mb-4">
              Project Requests
            </h2>
            {profile?.requests?.length > 0 ? (
              profile.requests.map((request, index) => (
                <div key={index} className="mb-4 bg-gray-700 p-4 rounded">
                  <p className="text-white font-semibold">
                    {request.project?.name || "Unnamed Project"}
                  </p>
                  <p className="text-gray-300 text-sm">
                    {request.project?.description}
                  </p>
                  <p className="text-gray-400 text-sm">
                    From: {request.sender?.username}
                  </p>
                  <div className="flex gap-4 mt-3">
                    <button
                      onClick={() => handleRespond(request._id, "accepted")}
                      className="bg-green-500 hover:bg-green-600 text-white px-4 py-1 rounded"
                    >
                      ✔️ Accept
                    </button>
                    <button
                      onClick={() => handleRespond(request._id, "rejected")}
                      className="bg-red-500 hover:bg-red-600 text-white px-4 py-1 rounded"
                    >
                      ❌ Reject
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-400">No requests found.</p>
            )}
          </div>
        </div>
      )} */}

      <Graph profile={profile} />
      {/* Projects */}
      <ProjectsSection profile={profile} />
    </div>
  );
}

// Simple reusable input (optional)
const Input = ({ label, register, type = "text", placeholder }) => (
  <div>
    <label className="block text-sm font-medium text-gray-300 mb-1">
      {label}
    </label>
    {type === "textarea" ? (
      <textarea
        {...register}
        className="w-full px-4 py-2 border rounded-lg bg-gray-700 text-gray-200"
      />
    ) : (
      <input
        type={type}
        {...register}
        placeholder={placeholder}
        className="w-full px-4 py-2 border rounded-lg bg-gray-700 text-gray-200"
      />
    )}
  </div>
);

export default Profile;
