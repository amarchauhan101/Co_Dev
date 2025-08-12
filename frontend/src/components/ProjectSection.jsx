import { FaGithub, FaExternalLinkAlt } from "react-icons/fa";
import { useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const ProjectCard = ({ project }) => {
  console.log("project data:", project);
  const navigate = useNavigate();
  // const users = useSelector((state) => state.userauth?.user?.userWithToken);
  const { user } = useAuth();
  const users = user?.userWithToken;
  const token = user?.userWithToken?.token;

  console.log("user in ProjectCard:", user);
  return (
    <div className="group relative bg-gray-900 rounded-xl border border-gray-700 p-6 shadow-md transition-all duration-300 hover:shadow-xl hover:border-blue-600">
      <h3 className="text-2xl font-semibold text-white group-hover:text-blue-400 mb-2">
        {project.name || "Untitled Project"}
      </h3>

      {project.description ? (
        <p className="text-gray-300 text-sm mb-3 line-clamp-2">
          {project.description}
        </p>
      ) : (
        <p className="text-gray-500 italic text-sm mb-3">
          No description added.
        </p>
      )}

      <div className="flex flex-wrap items-center text-sm gap-2 mb-4">
        <span className="text-gray-400">🚀 Tech:</span>
        <span className="text-gray-200 font-medium">
          {project.technologies || "Not specified"}
        </span>
      </div>

      <div className="mb-4">
        <span className="text-gray-400 text-sm">👥 Team:</span>
        <div className="flex items-center gap-2 mt-1">
          {project.user?.length > 0 ? (
            project.user.slice(0, 5).map((member, i) => (
              <Link 
                to={`/getdevprofile/${member._id}`}
                className="relative shrink-0"
              >
                <img
                  key={i}
                  src={
                    member.profileImage ||
                    member?.avatar ||
                    "/default-avatar.png"
                  }
                  alt={member.username}
                  title={member.username}
                  className="w-8 h-8 rounded-full border-2 border-gray-700 hover:border-blue-400 transition"
                />
              </Link>
            ))
          ) : (
            <span className="text-gray-500 italic text-sm">Solo Project</span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-4 mt-auto">
        {project.githubLink && (
          <a
            href={project.githubLink}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1 text-blue-400 text-sm hover:underline"
          >
            <FaGithub /> GitHub
          </a>
        )}
        {project.liveDemoLink && (
          <a
            href={project.liveDemoLink}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1 text-green-400 text-sm hover:underline"
          >
            <FaExternalLinkAlt /> Live Demo
          </a>
        )}
      </div>

      <p className="absolute bottom-2 right-4 text-xs text-gray-500">
        Last updated: {new Date(project.updatedAt).toLocaleDateString()}
      </p>
    </div>
  );
};

const ProjectsSection = ({ profile }) => {
  return (
    <div className="w-full max-w-6xl mx-auto mt-12">
      <h2 className="text-2xl font-bold text-white mb-6">🚧 Your Projects</h2>
      {profile?.projects?.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {profile.projects.map((project, index) => (
            <ProjectCard key={index} project={project} />
          ))}
        </div>
      ) : (
        <p className="text-gray-400 text-sm italic">
          You haven't added any projects yet.
        </p>
      )}
    </div>
  );
};

export default ProjectsSection;
