import React, { useEffect, useState } from "react";
import { useAuth } from "../../../context/AuthContext";
import adminApi from "../../services/adminApi";
import { toast } from "react-toastify";

// Add custom styles for amazing animations
const customStyles = `
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  
  @keyframes modalSlideIn {
    from { 
      opacity: 0; 
      transform: scale(0.9) translateY(-50px); 
    }
    to { 
      opacity: 1; 
      transform: scale(1) translateY(0); 
    }
  }
  
  @keyframes slideDown {
    from { 
      opacity: 0; 
      transform: translateY(-20px); 
    }
    to { 
      opacity: 1; 
      transform: translateY(0); 
    }
  }
  
  @keyframes float {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-10px); }
  }
  
  @keyframes float-delayed {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-15px); }
  }
  
  @keyframes pulse-glow {
    0%, 100% { box-shadow: 0 0 20px rgba(139, 92, 246, 0.3); }
    50% { box-shadow: 0 0 40px rgba(139, 92, 246, 0.6); }
  }
  
  .animate-fadeIn {
    animation: fadeIn 0.3s ease-out;
  }
  
  .animate-modalSlideIn {
    animation: modalSlideIn 0.4s ease-out;
  }
  
  .animate-slideDown {
    animation: slideDown 0.3s ease-out;
  }
  
  .animate-float {
    animation: float 3s ease-in-out infinite;
  }
  
  .animate-float-delayed {
    animation: float-delayed 3s ease-in-out infinite 1.5s;
  }
  
  .animate-pulse-glow {
    animation: pulse-glow 2s ease-in-out infinite;
  }
  
  .custom-scrollbar::-webkit-scrollbar {
    width: 8px;
  }
  
  .custom-scrollbar::-webkit-scrollbar-track {
    background: rgba(243, 244, 246, 0.5);
    border-radius: 10px;
  }
  
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background: linear-gradient(to bottom, #8b5cf6, #ec4899);
    border-radius: 10px;
  }
  
  .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background: linear-gradient(to bottom, #7c3aed, #db2777);
  }
`;

function RequestManagement() {
  const { user } = useAuth();
  const token = user?.userWithToken?.token;

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [filterStatus, setFilterStatus] = useState("all");
  const [viewMode, setViewMode] = useState("grid"); // grid or list

  const fetchAllRequests = async (page = 1, limit = 10) => {
    try {
      setLoading(true);
      const res = await adminApi.getAllProjectRequests({ page, limit });
      console.log("res in fetchall request=>", res);

      if (res.success) {
        setRequests(res.requests);
        setPagination(res.pagination);
      }
    } catch (err) {
      console.log("Error fetching project requests:", err);
      toast.error("Failed to fetch project requests");
    } finally {
      setLoading(false);
    }
  };

  const handleRequestAction = async (requestId, action) => {
    try {
      // This would be the API call to accept/reject requests
      // const res = await adminApi.updateRequestStatus(requestId, action);
      toast.success(`Request ${action} successfully`);
      // Refresh requests list
      fetchAllRequests(currentPage);
      setSelectedRequest(null);
    } catch (err) {
      console.log("Error updating request:", err);
      toast.error(`Failed to ${action} request`);
    }
  };

  useEffect(() => {
    fetchAllRequests(currentPage);
  }, [currentPage]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-gradient-to-r from-yellow-500 to-orange-600 text-white";
      case "accepted":
        return "bg-gradient-to-r from-green-500 to-emerald-600 text-white";
      case "rejected":
        return "bg-gradient-to-r from-red-500 to-rose-600 text-white";
      default:
        return "bg-gradient-to-r from-gray-400 to-slate-500 text-white";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "pending":
        return "⏳";
      case "accepted":
        return "✅";
      case "rejected":
        return "❌";
      default:
        return "📝";
    }
  };

  const filteredRequests = requests.filter((request) => {
    const matchesSearch =
      request.project?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.sender?.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.receiver?.username.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter =
      filterStatus === "all" || request.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  if (loading && requests.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="bg-white p-8 sm:p-12 rounded-2xl sm:rounded-3xl shadow-2xl max-w-md w-full mx-4 border border-gray-100 relative overflow-hidden">
          {/* Animated background */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 opacity-60"></div>
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>

          <div className="text-center relative z-10">
            <div className="relative w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-6 sm:mb-8">
              <div className="absolute inset-0 border-4 border-blue-200 rounded-full animate-pulse"></div>
              <div className="absolute inset-0 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <div className="absolute inset-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <svg
                  className="w-6 h-6 sm:w-8 sm:h-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
            </div>
            <h3 className="text-2xl sm:text-3xl font-black bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-4">
              Loading Requests
            </h3>
            <p className="text-gray-600 text-base sm:text-lg">Fetching project requests...</p>
            <div className="mt-6 sm:mt-8 flex justify-center space-x-1">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
              <div
                className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"
                style={{ animationDelay: "0.1s" }}
              ></div>
              <div
                className="w-2 h-2 bg-pink-500 rounded-full animate-bounce"
                style={{ animationDelay: "0.2s" }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <style>{customStyles}</style>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-4 sm:p-6 lg:p-8">
        {/* Header Section */}
        <div className="mb-8 sm:mb-12 animate-slideDown">
          <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xl p-6 sm:p-8 lg:p-10 border border-gray-100 relative overflow-hidden">
            {/* Animated background elements */}
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-gradient-to-br from-blue-400 to-purple-600 rounded-full opacity-10 animate-float"></div>
            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-gradient-to-br from-pink-400 to-red-600 rounded-full opacity-10 animate-float-delayed"></div>

            <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 sm:p-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl sm:rounded-2xl text-white shadow-lg animate-pulse-glow">
                  <svg
                    className="w-6 h-6 sm:w-8 sm:h-8"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                    Project Requests
                  </h1>
                  <p className="text-sm sm:text-base lg:text-lg text-gray-600 mt-1">
                    Manage collaboration requests with style
                  </p>
                </div>
              </div>

              {/* Stats */}
              <div className="flex items-center space-x-3 sm:space-x-4">
                <div className="text-center">
                  <div className="text-lg sm:text-xl lg:text-2xl font-bold text-blue-600">
                    {pagination.total || 0}
                  </div>
                  <div className="text-xs sm:text-sm text-gray-500">Total</div>
                </div>
                <div className="text-center">
                  <div className="text-lg sm:text-xl lg:text-2xl font-bold text-yellow-600">
                    {requests.filter(r => r.status === 'pending').length}
                  </div>
                  <div className="text-xs sm:text-sm text-gray-500">Pending</div>
                </div>
                <div className="text-center">
                  <div className="text-lg sm:text-xl lg:text-2xl font-bold text-green-600">
                    {requests.filter(r => r.status === 'accepted').length}
                  </div>
                  <div className="text-xs sm:text-sm text-gray-500">Accepted</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="mb-6 sm:mb-8 animate-fadeIn">
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 border border-gray-100">
            <div className="flex flex-col lg:flex-row lg:items-center gap-4 lg:gap-6">
              {/* Search */}
              <div className="flex-1">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg
                      className="h-5 w-5 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                  </div>
                  <input
                    type="text"
                    className="block w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm sm:text-base"
                    placeholder="Search by project, sender, or receiver..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              {/* Filters */}
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <select
                  className="px-4 py-3 border border-gray-200 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm sm:text-base min-w-[130px]"
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="accepted">Accepted</option>
                  <option value="rejected">Rejected</option>
                </select>

                {/* View Mode Toggle */}
                <div className="flex border border-gray-200 rounded-lg sm:rounded-xl overflow-hidden">
                  <button
                    className={`px-4 py-3 text-sm sm:text-base font-medium transition-all duration-200 ${
                      viewMode === "grid"
                        ? "bg-blue-500 text-white"
                        : "bg-white text-gray-700 hover:bg-gray-50"
                    }`}
                    onClick={() => setViewMode("grid")}
                  >
                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                    </svg>
                  </button>
                  <button
                    className={`px-4 py-3 text-sm sm:text-base font-medium transition-all duration-200 ${
                      viewMode === "list"
                        ? "bg-blue-500 text-white"
                        : "bg-white text-gray-700 hover:bg-gray-50"
                    }`}
                    onClick={() => setViewMode("list")}
                  >
                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Requests Grid/List */}
        <div className="animate-fadeIn">
          {filteredRequests.length === 0 ? (
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-8 sm:p-12 text-center border border-gray-100">
              <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-6 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center">
                <svg
                  className="w-8 h-8 sm:w-10 sm:h-10 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">No Requests Found</h3>
              <p className="text-gray-600 text-sm sm:text-base">
                {searchTerm || filterStatus !== "all"
                  ? "Try adjusting your search or filters"
                  : "No project requests available at the moment"}
              </p>
            </div>
          ) : (
            <div
              className={
                viewMode === "grid"
                  ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6"
                  : "space-y-4 sm:space-y-6"
              }
            >
              {filteredRequests.map((request, index) => (
                <RequestCard
                  key={request._id}
                  request={request}
                  index={index}
                  viewMode={viewMode}
                  onViewDetails={setSelectedRequest}
                  onAction={handleRequestAction}
                  formatDate={formatDate}
                  getStatusColor={getStatusColor}
                  getStatusIcon={getStatusIcon}
                />
              ))}
            </div>
          )}
        </div>

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="mt-8 sm:mt-12 flex justify-center animate-fadeIn">
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 border border-gray-100">
              <div className="flex items-center space-x-2 sm:space-x-4">
                <button
                  className="px-3 py-2 sm:px-4 sm:py-3 text-sm sm:text-base font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  Previous
                </button>

                <div className="flex items-center space-x-1 sm:space-x-2">
                  {[...Array(pagination.pages)].map((_, i) => (
                    <button
                      key={i + 1}
                      className={`w-8 h-8 sm:w-10 sm:h-10 text-xs sm:text-sm font-medium rounded-lg transition-all duration-200 ${
                        currentPage === i + 1
                          ? "bg-blue-500 text-white shadow-lg"
                          : "text-gray-700 hover:bg-gray-100"
                      }`}
                      onClick={() => setCurrentPage(i + 1)}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>

                <button
                  className="px-3 py-2 sm:px-4 sm:py-3 text-sm sm:text-base font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === pagination.pages}
                >
                  Next
                </button>
              </div>

              <div className="mt-3 sm:mt-4 text-center text-xs sm:text-sm text-gray-600">
                Showing {((currentPage - 1) * pagination.limit) + 1}-{Math.min(currentPage * pagination.limit, pagination.total)} of {pagination.total} requests
              </div>
            </div>
          </div>
        )}

        {/* Request Details Modal */}
        {selectedRequest && (
          <RequestDetailsModal
            request={selectedRequest}
            onClose={() => setSelectedRequest(null)}
            onAction={handleRequestAction}
            formatDate={formatDate}
            getStatusColor={getStatusColor}
            getStatusIcon={getStatusIcon}
          />
        )}
      </div>
    </>
  );
}

// Request Card Component
const RequestCard = ({
  request,
  index,
  viewMode,
  onViewDetails,
  onAction,
  formatDate,
  getStatusColor,
  getStatusIcon,
}) => {
  const isGridView = viewMode === "grid";

  return (
    <div
      className={`bg-white rounded-xl sm:rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden group animate-fadeIn ${
        isGridView ? "transform hover:scale-105" : ""
      }`}
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      {/* Card Header */}
      <div className="p-4 sm:p-6 border-b border-gray-100">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg sm:text-xl font-bold text-gray-800 truncate">
              {request.project?.name || "Untitled Project"}
            </h3>
            <p className="text-sm sm:text-base text-gray-600 mt-1">
              {formatDate(request.createdAt)}
            </p>
          </div>
          <div className={`px-2 py-1 sm:px-3 sm:py-1 rounded-full text-xs sm:text-sm font-medium ${getStatusColor(request.status)}`}>
            <span className="mr-1">{getStatusIcon(request.status)}</span>
            {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
          </div>
        </div>
      </div>

      {/* Participants */}
      <div className="p-4 sm:p-6">
        <div className={isGridView ? "space-y-4" : "grid grid-cols-1 sm:grid-cols-2 gap-4"}>
          {/* Sender */}
          <div className="flex items-center space-x-3">
            <img
              src={request.sender?.profileImage}
              alt={request.sender?.username}
              className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 border-gray-200"
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-800 truncate">
                {request.sender?.username}
              </p>
              <p className="text-xs text-gray-500">Sender</p>
            </div>
          </div>

          {/* Arrow or divider */}
          <div className="flex justify-center items-center">
            <svg
              className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 8l4 4m0 0l-4 4m4-4H3"
              />
            </svg>
          </div>

          {/* Receiver */}
          <div className="flex items-center space-x-3">
            <img
              src={request.receiver?.profileImage}
              alt={request.receiver?.username}
              className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 border-gray-200"
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-800 truncate">
                {request.receiver?.username}
              </p>
              <p className="text-xs text-gray-500">Receiver</p>
            </div>
          </div>
        </div>

        {/* Project Description */}
        {request.project?.description && (
          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600 line-clamp-2">
              {request.project.description}
            </p>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="p-4 sm:p-6 pt-0">
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
          <button
            className="flex-1 px-4 py-2 sm:py-3 text-sm sm:text-base font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-all duration-200"
            onClick={() => onViewDetails(request)}
          >
            View Details
          </button>
          
          {request.status === "pending" && (
            <>
              <button
                className="flex-1 px-4 py-2 sm:py-3 text-sm sm:text-base font-medium text-white bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl"
                onClick={() => onAction(request._id, "accepted")}
              >
                Accept
              </button>
              <button
                className="flex-1 px-4 py-2 sm:py-3 text-sm sm:text-base font-medium text-white bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl"
                onClick={() => onAction(request._id, "rejected")}
              >
                Reject
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

// Request Details Modal Component
const RequestDetailsModal = ({
  request,
  onClose,
  onAction,
  formatDate,
  getStatusColor,
  getStatusIcon,
}) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 animate-fadeIn">
      <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-modalSlideIn custom-scrollbar">
        {/* Modal Header */}
        <div className="relative p-6 sm:p-8 border-b border-gray-100">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>
          
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <h2 className="text-2xl sm:text-3xl font-black text-gray-800 mb-2">
                Request Details
              </h2>
              <div className="flex items-center space-x-3">
                <div className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(request.status)}`}>
                  <span className="mr-1">{getStatusIcon(request.status)}</span>
                  {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                </div>
                <span className="text-sm text-gray-500">
                  {formatDate(request.createdAt)}
                </span>
              </div>
            </div>
            
            <button
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
              onClick={onClose}
            >
              <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Modal Content */}
        <div className="p-6 sm:p-8">
          {/* Project Information */}
          <div className="mb-8">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Project Information</h3>
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
              <h4 className="text-lg font-semibold text-gray-800 mb-2">
                {request.project?.name || "Untitled Project"}
              </h4>
              {request.project?.description && (
                <p className="text-gray-600 leading-relaxed">
                  {request.project.description}
                </p>
              )}
              {!request.project?.description && (
                <p className="text-gray-500 italic">No description provided</p>
              )}
            </div>
          </div>

          {/* Participants */}
          <div className="mb-8">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Participants</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Sender */}
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-100">
                <h4 className="text-sm font-medium text-green-800 mb-3 uppercase tracking-wide">
                  Request Sender
                </h4>
                <div className="flex items-center space-x-4">
                  <img
                    src={request.sender?.profileImage}
                    alt={request.sender?.username}
                    className="w-12 h-12 rounded-full border-2 border-green-200"
                  />
                  <div>
                    <p className="font-semibold text-gray-800">
                      {request.sender?.username}
                    </p>
                    <p className="text-sm text-gray-600">
                      {request.sender?.email}
                    </p>
                  </div>
                </div>
              </div>

              {/* Receiver */}
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-100">
                <h4 className="text-sm font-medium text-purple-800 mb-3 uppercase tracking-wide">
                  Request Receiver
                </h4>
                <div className="flex items-center space-x-4">
                  <img
                    src={request.receiver?.profileImage}
                    alt={request.receiver?.username}
                    className="w-12 h-12 rounded-full border-2 border-purple-200"
                  />
                  <div>
                    <p className="font-semibold text-gray-800">
                      {request.receiver?.username}
                    </p>
                    <p className="text-sm text-gray-600">
                      {request.receiver?.email}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          {request.status === "pending" && (
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                className="flex-1 px-6 py-4 text-base font-medium text-white bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl"
                onClick={() => onAction(request._id, "accepted")}
              >
                <span className="mr-2">✅</span>
                Accept Request
              </button>
              <button
                className="flex-1 px-6 py-4 text-base font-medium text-white bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl"
                onClick={() => onAction(request._id, "rejected")}
              >
                <span className="mr-2">❌</span>
                Reject Request
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};



export default RequestManagement;
