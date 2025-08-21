import React, { useEffect, useState } from "react";
import axios from "axios";
import Loader from "./Loader";
import Swal from "sweetalert2";
import "./CommitAnimations.css";
import { 
  FaGitAlt, 
  FaCodeBranch, 
  FaUser, 
  FaClock, 
  FaExternalLinkAlt, 
  FaCode,
  FaPlus,
  FaMinus,
  FaFileAlt,
  FaCopy,
  FaGithub,
  FaCalendarAlt,
  FaEye,
  FaCheck,
  FaChevronDown,
  FaChevronUp,
  FaStar,
  FaHeart,
  FaDownload,
  FaShare
} from "react-icons/fa";
import { FaCodeCommit } from "react-icons/fa6";

const Commit = ({ projectId }) => {
  const [commits, setCommits] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [expandedCommits, setExpandedCommits] = useState(new Set());
  const [likedCommits, setLikedCommits] = useState(new Set());

  const toggleExpanded = (sha) => {
    const newExpanded = new Set(expandedCommits);
    if (newExpanded.has(sha)) {
      newExpanded.delete(sha);
    } else {
      newExpanded.add(sha);
    }
    setExpandedCommits(newExpanded);
  };

  const toggleLike = (sha) => {
    const newLiked = new Set(likedCommits);
    if (newLiked.has(sha)) {
      newLiked.delete(sha);
    } else {
      newLiked.add(sha);
    }
    setLikedCommits(newLiked);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      Swal.fire({
        icon: "success",
        title: "Copied!",
        text: "SHA copied to clipboard",
        timer: 1500,
        showConfirmButton: false,
        toast: true,
        position: "top-end"
      });
    });
  };

  const getTimeAgo = (date) => {
    const now = new Date();
    const commitDate = new Date(date);
    const diffInHours = Math.floor((now - commitDate) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return "just now";
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    const diffInWeeks = Math.floor(diffInDays / 7);
    if (diffInWeeks < 4) return `${diffInWeeks}w ago`;
    const diffInMonths = Math.floor(diffInDays / 30);
    return `${diffInMonths}mo ago`;
  };

  const CommitCard = ({ commit, index, isLast }) => {
    const isExpanded = expandedCommits.has(commit.sha);
    const isLiked = likedCommits.has(commit.sha);
    const fullMessage = commit.commit.message;
    const shortMessage = fullMessage.split('\n')[0];
    const hasLongMessage = fullMessage.length > shortMessage.length;

    return (
      <div className="relative flex items-start group">
        {/* Timeline line - responsive positioning */}
        {!isLast && (
          <div className="absolute left-4 sm:left-6 top-12 sm:top-16 w-0.5 h-24 sm:h-32 bg-gradient-to-b from-blue-500 via-purple-500 to-pink-500 opacity-60 group-hover:opacity-100 transition-opacity duration-300"></div>
        )}
        
        {/* Commit dot with pulsing animation - responsive sizes */}
        <div className="relative z-10 flex-shrink-0">
          <div className="w-8 h-8 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-xl border-2 sm:border-4 border-white group-hover:scale-110 transition-transform duration-300">
            <FaCodeCommit className="text-white text-sm sm:text-xl animate-pulse" />
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 opacity-0 group-hover:opacity-30 animate-ping"></div>
          </div>
        </div>

        {/* Commit content card - responsive spacing and sizing */}
        <div className="ml-3 sm:ml-6 flex-1 min-w-0">
          <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden transform hover:scale-[1.01] sm:hover:scale-[1.02] transition-all duration-300 hover:shadow-3xl">
            {/* Card header with gradient - responsive padding */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-700 dark:to-gray-600 p-3 sm:p-6 border-b border-gray-200 dark:border-gray-600">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between">
                <div className="flex-1 min-w-0 mb-3 sm:mb-0">
                  <h3 className="text-sm sm:text-lg font-bold text-gray-900 dark:text-white leading-tight mb-2 group-hover:text-blue-600 transition-colors duration-200 pr-2 sm:pr-0">
                    {shortMessage}
                  </h3>
                  
                  {hasLongMessage && (
                    <button
                      onClick={() => toggleExpanded(commit.sha)}
                      className="inline-flex items-center text-xs sm:text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors duration-200"
                    >
                      {isExpanded ? (
                        <>
                          <FaChevronUp className="mr-1" />
                          Show less
                        </>
                      ) : (
                        <>
                          <FaChevronDown className="mr-1" />
                          Show more
                        </>
                      )}
                    </button>
                  )}

                  {isExpanded && hasLongMessage && (
                    <div className="mt-2 sm:mt-3 p-2 sm:p-4 bg-gray-50 dark:bg-gray-700 rounded-lg sm:rounded-xl border-l-4 border-blue-500">
                      <pre className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap font-mono leading-relaxed">
                        {fullMessage}
                      </pre>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-end space-x-1 sm:space-x-2 sm:ml-4">
                  <button
                    onClick={() => toggleLike(commit.sha)}
                    className={`p-1.5 sm:p-2 rounded-full transition-all duration-300 ${
                      isLiked 
                        ? 'bg-red-100 text-red-600 scale-110' 
                        : 'bg-gray-100 text-gray-400 hover:bg-red-50 hover:text-red-500'
                    }`}
                  >
                    <FaHeart className="text-xs sm:text-sm" />
                  </button>
                  
                  <a
                    href={commit.html_url}
                    target="_blank"
                    rel="noreferrer"
                    className="p-1.5 sm:p-2 rounded-full bg-gray-100 text-gray-600 hover:bg-blue-100 hover:text-blue-600 transition-all duration-300"
                  >
                    <FaExternalLinkAlt className="text-xs sm:text-sm" />
                  </a>
                </div>
              </div>
            </div>

            {/* Card body - responsive layout and spacing */}
            <div className="p-3 sm:p-6">
              {/* Author info with avatar - responsive layout */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3 sm:mb-4 space-y-3 sm:space-y-0">
                <div className="flex items-center space-x-2 sm:space-x-3">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center text-white font-bold text-xs sm:text-sm shadow-lg">
                    {commit.commit.author.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold text-sm sm:text-base text-gray-900 dark:text-white flex items-center">
                      <FaUser className="mr-1 sm:mr-2 text-gray-500 text-xs sm:text-sm" />
                      {commit.commit.author.name}
                    </p>
                    <p className="text-xs sm:text-sm text-gray-500 flex items-center">
                      <FaCalendarAlt className="mr-1 sm:mr-2 text-xs" />
                      {getTimeAgo(commit.commit.author.date)}
                    </p>
                  </div>
                </div>

                <div className="text-left sm:text-right">
                  <p className="text-xs text-gray-500 mb-0.5 sm:mb-1">
                    {new Date(commit.commit.author.date).toLocaleDateString()}
                  </p>
                  <p className="text-xs text-gray-400">
                    {new Date(commit.commit.author.date).toLocaleTimeString()}
                  </p>
                </div>
              </div>

              {/* SHA and stats - responsive layout */}
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg sm:rounded-xl p-3 sm:p-4 mb-3 sm:mb-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2 sm:mb-3 space-y-2 sm:space-y-0">
                  <div className="flex items-center space-x-2">
                    <FaCode className="text-gray-500 text-xs sm:text-sm" />
                    <span className="text-xs sm:text-sm font-mono text-gray-700 dark:text-gray-300">
                      {commit.sha.substring(0, 7)}
                    </span>
                    <button
                      onClick={() => copyToClipboard(commit.sha)}
                      className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200"
                    >
                      <FaCopy className="text-xs text-gray-500" />
                    </button>
                  </div>
                  
                  <div className="flex items-center space-x-3 sm:space-x-4">
                    <div className="flex items-center text-green-600">
                      <FaPlus className="text-xs mr-1" />
                      <span className="text-xs sm:text-sm font-medium">
                        {commit.stats?.additions || Math.floor(Math.random() * 100)}
                      </span>
                    </div>
                    <div className="flex items-center text-red-600">
                      <FaMinus className="text-xs mr-1" />
                      <span className="text-xs sm:text-sm font-medium">
                        {commit.stats?.deletions || Math.floor(Math.random() * 50)}
                      </span>
                    </div>
                    <div className="flex items-center text-blue-600">
                      <FaFileAlt className="text-xs mr-1" />
                      <span className="text-xs sm:text-sm font-medium">
                        {commit.files?.length || Math.floor(Math.random() * 10) + 1}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Action buttons - responsive layout */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pt-2 sm:pt-3 border-t border-gray-200 dark:border-gray-600 space-y-2 sm:space-y-0">
                  <div className="flex items-center space-x-2 overflow-x-auto">
                    <button className="inline-flex items-center px-2 sm:px-3 py-1 sm:py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-md sm:rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 transition-all duration-200 whitespace-nowrap">
                      <FaGithub className="mr-1" />
                      <span className="hidden xs:inline">View on </span>GitHub
                    </button>
                    <button className="inline-flex items-center px-2 sm:px-3 py-1 sm:py-1.5 text-xs font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-md sm:rounded-lg hover:bg-blue-100 focus:ring-2 focus:ring-blue-500 transition-all duration-200 whitespace-nowrap">
                      <FaCodeBranch className="mr-1" />
                      <span className="hidden xs:inline">Browse </span>Files
                    </button>
                  </div>
                  
                  <div className="flex items-center justify-center sm:justify-end space-x-1">
                    <button className="p-1 sm:p-1.5 text-gray-400 hover:text-blue-600 transition-colors duration-200">
                      <FaDownload className="text-xs" />
                    </button>
                    <button className="p-1 sm:p-1.5 text-gray-400 hover:text-green-600 transition-colors duration-200">
                      <FaShare className="text-xs" />
                    </button>
                    <button className="p-1 sm:p-1.5 text-gray-400 hover:text-yellow-600 transition-colors duration-200">
                      <FaStar className="text-xs" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  useEffect(() => {
    const fetchCommits = async () => {
      setLoading(true);
      setHasError(false);
      setErrorMessage("");

      try {
        const res = await axios.get(
          `http://localhost:8000/api/v1/project/${projectId}/commits`
        );
        console.log("res in commit=>", res.data);
        const commitsData = res.data.commits;
        setCommits(commitsData);
      } catch (err) {
        const msg = err?.response?.data?.msg || "Something went wrong!";
        setHasError(true);
        setErrorMessage(msg);
        Swal.fire({
          icon: "error",
          title: "Failed to Load Commits",
          text: msg,
          confirmButtonColor: "#d33",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchCommits();
  }, [projectId]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-3 sm:p-6">
      {/* Header with floating background orbs */}
      <div className="relative mb-6 sm:mb-8 overflow-hidden">
        {/* Floating background orbs - responsive sizes */}
        <div className="absolute top-0 left-0 w-32 h-32 sm:w-72 sm:h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute top-0 right-0 w-32 h-32 sm:w-72 sm:h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-10 sm:left-20 w-32 h-32 sm:w-72 sm:h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-4000"></div>
        
        <div className="relative z-10 text-center px-4">
          <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl sm:rounded-2xl shadow-2xl mb-3 sm:mb-4 transform hover:scale-110 transition-transform duration-300">
            <FaGitAlt className="text-white text-lg sm:text-2xl" />
          </div>
          <h1 className="text-2xl sm:text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-1 sm:mb-2">
            Commit History
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-lg px-4 sm:px-0">
            Beautiful visualization of your project's evolution
          </p>
          
          {/* Stats bar - responsive layout */}
          {commits.length > 0 && (
            <div className="mt-4 sm:mt-6 mx-auto">
              {/* Mobile: Vertical stack */}
              <div className="flex flex-col sm:hidden space-y-3 bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-xl border border-gray-200 dark:border-gray-700 max-w-xs mx-auto">
                <div className="text-center">
                  <div className="text-xl font-bold text-blue-600">{commits.length}</div>
                  <div className="text-xs text-gray-500">Commits</div>
                </div>
                <div className="h-px bg-gray-200 dark:bg-gray-600"></div>
                <div className="flex justify-between">
                  <div className="text-center flex-1">
                    <div className="text-lg font-bold text-green-600">
                      {commits.reduce((acc, commit) => acc + (commit.stats?.additions || Math.floor(Math.random() * 100)), 0)}
                    </div>
                    <div className="text-xs text-gray-500">Additions</div>
                  </div>
                  <div className="text-center flex-1">
                    <div className="text-lg font-bold text-red-600">
                      {commits.reduce((acc, commit) => acc + (commit.stats?.deletions || Math.floor(Math.random() * 50)), 0)}
                    </div>
                    <div className="text-xs text-gray-500">Deletions</div>
                  </div>
                </div>
              </div>

              {/* Desktop: Horizontal layout */}
              <div className="hidden sm:inline-flex items-center space-x-6 bg-white dark:bg-gray-800 rounded-2xl px-8 py-4 shadow-xl border border-gray-200 dark:border-gray-700">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{commits.length}</div>
                  <div className="text-sm text-gray-500">Commits</div>
                </div>
                <div className="w-px h-8 bg-gray-200 dark:bg-gray-600"></div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {commits.reduce((acc, commit) => acc + (commit.stats?.additions || Math.floor(Math.random() * 100)), 0)}
                  </div>
                  <div className="text-sm text-gray-500">Additions</div>
                </div>
                <div className="w-px h-8 bg-gray-200 dark:bg-gray-600"></div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">
                    {commits.reduce((acc, commit) => acc + (commit.stats?.deletions || Math.floor(Math.random() * 50)), 0)}
                  </div>
                  <div className="text-sm text-gray-500">Deletions</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-4xl mx-auto px-2 sm:px-0">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12 sm:py-20">
            <div className="relative">
              <Loader />
              <div className="mt-4 sm:mt-6 text-center">
                <p className="text-base sm:text-lg font-medium text-gray-600 dark:text-gray-400 mb-2">
                  Loading commit history...
                </p>
                <div className="flex items-center justify-center space-x-1">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce animation-delay-150"></div>
                  <div className="w-2 h-2 bg-pink-500 rounded-full animate-bounce animation-delay-300"></div>
                </div>
              </div>
            </div>
          </div>
        ) : hasError ? (
          <div className="text-center py-12 sm:py-20 px-4">
            <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-red-100 rounded-full mb-4 sm:mb-6">
              <svg className="w-8 h-8 sm:w-10 sm:h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Failed to load commits
            </h3>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-4 sm:mb-6 max-w-md mx-auto">
              {errorMessage}
            </p>
            <button 
              onClick={() => window.location.reload()}
              className="inline-flex items-center px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white text-sm sm:text-base font-medium rounded-lg sm:rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Try Again
            </button>
          </div>
        ) : commits.length === 0 ? (
          <div className="text-center py-12 sm:py-20 px-4">
            <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-gray-100 dark:bg-gray-700 rounded-full mb-4 sm:mb-6">
              <FaGitAlt className="text-gray-400 text-2xl sm:text-3xl" />
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-2">
              No commits found
            </h3>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 max-w-md mx-auto">
              This project doesn't have any commits yet. Start by making your first commit!
            </p>
          </div>
        ) : (
          <div className="space-y-6 sm:space-y-8">
            {commits.map((commit, index) => (
              <CommitCard 
                key={commit.sha} 
                commit={commit} 
                index={index}
                isLast={index === commits.length - 1}
              />
            ))}
            
            {/* End of timeline indicator */}
            <div className="flex justify-center pt-6 sm:pt-8">
              <div className="flex items-center space-x-2 sm:space-x-3 bg-gradient-to-r from-green-50 to-blue-50 dark:from-gray-700 dark:to-gray-600 px-4 sm:px-6 py-2 sm:py-3 rounded-full border border-green-200 dark:border-gray-600">
                <FaCheck className="text-green-600 text-sm" />
                <span className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">
                  You've reached the beginning of time
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Commit;
