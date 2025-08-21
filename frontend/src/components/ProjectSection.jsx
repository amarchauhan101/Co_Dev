import { FaGithub, FaExternalLinkAlt, FaCalendarAlt, FaUsers, FaCode, FaStar } from "react-icons/fa";
import { useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import './AnalyticsStyles.css';

const ProjectCard = ({ project }) => {
  console.log("project data:", project);
  const navigate = useNavigate();
  // const users = useSelector((state) => state.userauth?.user?.userWithToken);
  const { user } = useAuth();
  const users = user?.userWithToken;
  const token = user?.userWithToken?.token;

  console.log("user in ProjectCard:", user);
  return (
    <div className="group relative overflow-hidden bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-xl rounded-xl sm:rounded-2xl lg:rounded-3xl border border-gray-700/50 hover:border-blue-500/50 shadow-xl hover:shadow-2xl hover:shadow-blue-500/30 transition-all duration-500 transform hover:scale-[1.02] hover:-translate-y-1 sm:hover:-translate-y-2">
      {/* Background gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 to-purple-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      
      {/* Floating background elements */}
      <div className="absolute top-2 right-2 sm:top-4 sm:right-4 w-8 h-8 sm:w-12 sm:h-12 lg:w-16 lg:h-16 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
      <div className="absolute bottom-2 left-2 sm:bottom-4 sm:left-4 w-6 h-6 sm:w-8 sm:h-8 lg:w-12 lg:h-12 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      
      <div className="relative z-10 p-4 sm:p-6 lg:p-8">
        {/* Project Header */}
        <div className="flex items-start justify-between mb-3 sm:mb-4">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-white group-hover:text-blue-400 mb-2 transition-colors duration-300 truncate leading-tight">
              🚀 {project.name || "Untitled Project"}
            </h3>
            <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-400">
              <FaCalendarAlt className="text-blue-400 flex-shrink-0" />
              <span className="truncate">Updated {new Date(project.updatedAt).toLocaleDateString()}</span>
            </div>
          </div>
          <div className="flex items-center gap-2 ml-2 sm:ml-4 flex-shrink-0">
            <div className="p-1.5 sm:p-2 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-lg xl:rounded-xl backdrop-blur-sm">
              <FaCode className="text-blue-400 text-sm sm:text-base" />
            </div>
          </div>
        </div>

        {/* Project Description */}
        <div className="mb-4 sm:mb-6">
          {project.description ? (
            <p className="text-gray-300 text-sm sm:text-base leading-relaxed line-clamp-2 sm:line-clamp-3">
              {project.description}
            </p>
          ) : (
            <p className="text-gray-500 italic text-sm sm:text-base">
              📝 No description added yet.
            </p>
          )}
        </div>

        {/* Technologies */}
        <div className="mb-4 sm:mb-6">
          <div className="flex items-center gap-2 mb-2 sm:mb-3">
            <div className="p-1 sm:p-1.5 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-lg flex-shrink-0">
              <FaStar className="text-green-400 text-xs sm:text-sm" />
            </div>
            <span className="text-gray-400 text-xs sm:text-sm font-medium">💫 Technologies</span>
          </div>
          <div className="flex flex-wrap gap-1.5 sm:gap-2">
            {project.technologies ? (
              project.technologies.split(',').slice(0, 6).map((tech, index) => (
                <span
                  key={index}
                  className="px-2 sm:px-3 py-1 sm:py-1.5 bg-gradient-to-r from-blue-500/20 to-purple-500/20 backdrop-blur-sm rounded-full text-xs sm:text-sm font-medium text-blue-300 border border-blue-500/30 hover:border-blue-400/50 transition-colors duration-300"
                >
                  {tech.trim()}
                </span>
              ))
            ) : (
              <span className="text-gray-500 italic text-xs sm:text-sm">Not specified</span>
            )}
            {project.technologies?.split(',').length > 6 && (
              <span className="px-2 sm:px-3 py-1 sm:py-1.5 bg-gradient-to-r from-gray-600/20 to-gray-500/20 backdrop-blur-sm rounded-full text-xs sm:text-sm font-medium text-gray-400 border border-gray-500/30">
                +{project.technologies.split(',').length - 6}
              </span>
            )}
          </div>
        </div>

        {/* Team Members */}
        <div className="mb-4 sm:mb-6">
          <div className="flex items-center gap-2 mb-2 sm:mb-3">
            <div className="p-1 sm:p-1.5 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-lg flex-shrink-0">
              <FaUsers className="text-purple-400 text-xs sm:text-sm" />
            </div>
            <span className="text-gray-400 text-xs sm:text-sm font-medium">👥 Team Members</span>
            {project.user?.length > 0 && (
              <span className="text-xs bg-purple-500/20 text-purple-300 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full">
                {project.user.length}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            {project.user?.length > 0 ? (
              <>
                <div className="flex -space-x-1 sm:-space-x-2">
                  {project.user.slice(0, 3).map((member, i) => (
                    <Link 
                      key={i}
                      to={`/getdevprofile/${member._id}`}
                      className="relative group/avatar"
                    >
                      <img
                        src={
                          member.profileImage ||
                          member?.avatar ||
                          "/default-avatar.png"
                        }
                        alt={member.username}
                        title={member.username}
                        className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-full border-2 sm:border-3 border-gray-700 group-hover/avatar:border-blue-400 transition-all duration-300 hover:scale-110 hover:z-10 relative shadow-lg"
                      />
                      <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-blue-500/20 to-purple-500/20 opacity-0 group-hover/avatar:opacity-100 transition-opacity duration-300"></div>
                    </Link>
                  ))}
                </div>
                {project.user.length > 3 && (
                  <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-full bg-gradient-to-br from-gray-700 to-gray-600 border-2 border-gray-600 text-xs sm:text-sm font-semibold text-gray-300">
                    +{project.user.length - 3}
                  </div>
                )}
              </>
            ) : (
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-full bg-gradient-to-br from-gray-700 to-gray-600 border-2 border-gray-600 flex items-center justify-center">
                  <FaUsers className="text-gray-400 text-xs sm:text-sm" />
                </div>
                <span className="text-gray-500 italic text-xs sm:text-sm">👤 Solo Project</span>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2 sm:gap-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
            {project.githubLink && (
              <a
                href={project.githubLink}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2.5 sm:py-3 bg-gradient-to-r from-gray-700 to-gray-600 hover:from-gray-600 hover:to-gray-500 text-white rounded-lg sm:rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-lg group/btn border border-gray-600 hover:border-gray-500 text-sm sm:text-base"
              >
                <FaGithub className="group-hover/btn:rotate-12 transition-transform duration-300 text-sm sm:text-base" />
                <span className="font-medium">GitHub</span>
              </a>
            )}
            {project.liveDemoLink && (
              <a
                href={project.liveDemoLink}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2.5 sm:py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white rounded-lg sm:rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-lg group/btn border border-green-500 hover:border-green-400 text-sm sm:text-base"
              >
                <FaExternalLinkAlt className="group-hover/btn:rotate-12 transition-transform duration-300 text-sm sm:text-base" />
                <span className="font-medium">Live Demo</span>
              </a>
            )}
          </div>
          {!project.githubLink && !project.liveDemoLink && (
            <div className="text-center py-2 sm:py-3 text-gray-500 text-xs sm:text-sm italic">
              🔗 No links available
            </div>
          )}
        </div>
      </div>
      
      {/* Shimmer effect on hover */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
      </div>
    </div>
  );
};

const ProjectsSection = ({ profile }) => {
  return (
    <div className="w-full max-w-7xl mx-auto px-2 sm:px-4 lg:px-6">
      {/* Section Header */}
      <div className="text-center mb-6 sm:mb-8 lg:mb-12">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mb-4 sm:mb-6">
          <div className="p-3 sm:p-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl sm:rounded-2xl shadow-lg icon-float">
            <FaCode className="text-2xl sm:text-3xl text-white" />
          </div>
          <div className="text-center sm:text-left">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent leading-tight">
              🎯 Featured Projects
            </h2>
            <p className="text-gray-400 text-sm sm:text-base lg:text-lg mt-1 sm:mt-2">✨ Showcase of technical excellence</p>
          </div>
        </div>
        
        {profile?.projects?.length > 0 && (
          <div className="flex items-center justify-center gap-2 text-xs sm:text-sm text-gray-400">
            <FaStar className="text-yellow-400" />
            <span>🏆 {profile.projects.length} project{profile.projects.length !== 1 ? 's' : ''} completed</span>
          </div>
        )}
      </div>

      {/* Projects Grid */}
      {profile?.projects?.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          {profile.projects.map((project, index) => (
            <div
              key={index}
              className="animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <ProjectCard project={project} />
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 sm:py-12 lg:py-16">
          <div className="max-w-sm sm:max-w-md mx-auto px-4">
            <div className="p-4 sm:p-6 bg-gradient-to-br from-gray-800/50 to-gray-700/50 backdrop-blur-xl rounded-2xl sm:rounded-3xl border border-gray-600/50">
              <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 sm:mb-6 bg-gradient-to-br from-gray-600 to-gray-500 rounded-xl sm:rounded-2xl flex items-center justify-center">
                <FaCode className="text-2xl sm:text-3xl text-gray-300" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-white mb-2 sm:mb-3">📝 No Projects Yet</h3>
              <p className="text-gray-400 text-sm sm:text-base leading-relaxed mb-4 sm:mb-6">
                🚀 Start building amazing projects and showcase your skills to the world!
              </p>
              <button className="w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white rounded-lg sm:rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-lg font-medium text-sm sm:text-base">
                ✨ Create First Project
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectsSection;
