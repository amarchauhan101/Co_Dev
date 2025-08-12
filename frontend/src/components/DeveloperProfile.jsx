import axios from "axios";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { FaYoutube } from "react-icons/fa6";
import { FaBell, FaFacebookF } from "react-icons/fa";
import { AiFillInstagram } from "react-icons/ai";
import { FaLinkedin } from "react-icons/fa";
import { FaTwitter } from "react-icons/fa";
import Loader from "./Loader";
import ProfileDev from "./ProfileDev";
import {
  getInterestIcon,
  getSkillIcon,
  getSocialIcon,
} from "../utils/iconMapper";
import { Graph } from "./Graph";
import ProjectsSection from "./ProjectSection";
import { getDeveloperProfile } from "../utils/devProfileApi";
import { useAuth } from "../../context/AuthContext";

function DeveloperProfile() {
  const {user} = useAuth();
  const userWithToken = user?.userWithToken;
  const token = userWithToken?.token;
  const { id } = useParams();
  console.log("id in dev profile", id);
  const [userData, setuserData] = useState([]);
  const [loading, setloading] = useState(true);
  console.log("user =>", user);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    console.log("inside useeffect");
    const getdevprofile = async () => {
      try {
        console.log("inside try");
        const res = await getDeveloperProfile(id,token);
        console.log("below res");
        console.log("res of dev", res);
        setuserData(res);
        setloading(false);
      } catch (error) {
        console.error(error);
      }
    };
    getdevprofile();
  }, [id]);
  if (loading) {
    return <Loader />;
  }
  return (
    <div className="min-h-screen font-fira bg-gray-900 text-gray-200 py-8 px-4 flex flex-col items-center">
      {/* Header */}
      <div className="w-full flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-100">Your Profile</h1>
        <div className="relative">
          <FaBell
            className="w-6 h-6 text-gray-200 cursor-pointer"
            onClick={() => setShowModal(true)}
          />
          {userData?.profile?.requests?.length > 0 && (
            <span className="absolute top-[-4px] right-[-6px] bg-red-500 text-white text-xs rounded-full px-1">
              {userData?.profile.requests.length}
            </span>
          )}
        </div>
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
              {userData?.profile?.isactive && (
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
                {userData?.profile?.bio || "No bio available"}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-sm mt-3">
                <p>
                  <span className="font-semibold text-emerald-400">
                    ⚙ Experience:
                  </span>{" "}
                  {userData?.profile?.experienceLevel || "Not specified"}
                </p>
                <p>
                  <span className="font-semibold text-emerald-400">
                    🐱‍💻 GitHub Commits:
                  </span>{" "}
                  {userData?.profile?.githubCommits ?? 0}
                </p>
                <p className="sm:col-span-2">
                  <span className="font-semibold text-emerald-400">
                    🟢 Active At:
                  </span>{" "}
                  {new Date(userData?.profile?.activeat).toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          {/* Edit Form */}

          <>
            {/* Education & Experience */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-4">
              <div>
                <h4 className="text-lg font-semibold text-emerald-300 mb-1">
                  🎓 Education
                </h4>
                <p className="text-sm text-gray-300">
                  {userData?.profile?.education || "Not specified"}
                </p>
              </div>
              <div>
                <h4 className="text-lg font-semibold text-emerald-300 mb-1">
                  💼 Experience
                </h4>
                <p className="text-sm text-gray-300">
                  {userData?.profile?.experience || "Not specified"}
                </p>
              </div>
            </div>

            {/* Skills */}
            <div>
              <h4 className="text-lg font-semibold text-emerald-300 mb-2">
                🛠 Skills
              </h4>
              <div className="flex flex-wrap gap-3">
                {userData?.profile?.skills?.length ? (
                  userData?.profile.skills.map((skill, index) => {
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
                {userData?.profile?.interests?.length ? (
                  userData?.profile.interests.map((interest, index) => (
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
                {Object.entries(userData?.profile?.social || {}).map(
                  ([key, value]) => {
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
                  }
                )}
              </div>
            </div>
          </>
        </div>

        {/* Right Column - Developer Analytics */}
        <div className="col-span-1 overflow-auto max-h-[calc(100vh-8rem)]">
          <ProfileDev profile={userData?.profile} />
        </div>
      </div>

      {/* Notification Modal */}

      <Graph profile={userData?.profile} />
      {/* Projects */}
      <ProjectsSection profile={userData?.profile} />
    </div>
  );
}

export default DeveloperProfile;
