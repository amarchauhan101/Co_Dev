import React, { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { initializeSocket, sendMessage } from "../config/socket";
import axios from "axios";
import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";

import Loader from "./Loader";
import hljs from "highlight.js";
import "highlight.js/styles/github-dark.css"; // Choose any theme you like
import CollaborativeEditor from "./CollaborativeEditor";
import { useParams, useLocation } from "react-router-dom";
import { VariableSizeList as List } from "react-window";

import { MdCancel, MdScreenShare, MdStopScreenShare } from "react-icons/md";
import { uploadFileToFirebase } from "../utils/uploadFileToFirebase";
import {
  FaMicrophone,
  FaMicrophoneSlash,
  FaVideo,
  FaVideoSlash,
} from "react-icons/fa";
import io from "socket.io-client";
import moment from "moment";
import ProjectDashboard from "./ProjectDashboard";
import Commit from "./Commit";
import FileExplorer from "./FileExplorer";
import { v4 as uuidv4 } from "uuid"; // Import this at the top
import Swal from "sweetalert2";
import { useAuth } from "../../context/AuthContext";

function Chat() {
  const { projectId: paramId } = useParams();
  const { state } = useLocation();
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState({});
  const [projects, setProjects] = useState([]);
  const [projectId, setProjectId] = useState(
    paramId || state?.projectId || null
  );
  const [isMember, setIsMember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [projetownerId, setprojetownerId] = useState(null);
  const [showEditor, setShowEditor] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userinproject, setUserinproject] = useState([]);
  const [showtask, setshowtask] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [task, setTask] = useState([]);
  const users = localStorage.getItem("user");
  console.log("users in chat", users);
  const [assignedTo, setassignedTo] = useState([]);
  const [mytask, setMytask] = useState([]);
  const { user } = useAuth();
  const token = user?.userWithToken?.token;
  console.log("user in chat component=>", user);
  const socketRef = useRef(null);
  const listRef = useRef();
  const itemSizeMap = useRef({});
  // Typing show functionality
  const [typingTimeout, setTypingTimeout] = useState(null);
  const [typingUsers, setTypingUsers] = useState([]);
  const typingtimeoutref = useRef(null);
  const [selectedFile, setSelectedFile] = useState(null);

  console.log("userinproject=>", userinproject);

  const userWithToken = user?.userWithToken;

  useEffect(() => {
    if (paramId && paramId !== projectId) {
      setProjectId(paramId);
    } else if (state?.projectId && !projectId) {
      setProjectId(state.projectId);
    }
  }, [paramId, state, projectId]);

  const navigate = useNavigate();
  const handletoggle = (user) => {
    setassignedTo((prev) =>
      prev.includes(user) ? prev.filter((id) => id != user) : [...prev, user]
    );
  };

  const { register, handleSubmit, reset } = useForm();

  useEffect(() => {
    const fetchUserProjects = async () => {
      try {
        const res = await axios.get("http://localhost:8000/api/v1/getproject", {
          headers: { authorization: `Bearer ${token}` },
        });
        if (res.data.newproject?.length) {
          setProjects(res.data.newproject);
        }
      } catch (error) {
        console.error("Error fetching user's projects:", error);
      }
    };
    fetchUserProjects();
  }, [token]);

  const selectProject = (id) => {
    console.log("id in selectedproject=>", id);
    if (id === projectId) return; // already selected
    setProjectId(id); // triggers useEffect below
    navigate(`/getproject/${id}`, { replace: true });
    setSidebarOpen(false); // collapse on mobile
  };

  // -------- auto‑fetch when projectId changes ----------
  useEffect(() => {
    if (!projectId) return;

    const token = JSON.parse(localStorage.getItem("user"))?.userWithToken
      ?.token;

    const fetchAll = async () => {
      setLoading(true);
      try {
        const [msgRes, usrRes, taskRes] = await Promise.all([
          axios.get(`http://localhost:8000/api/v1/getmessage/${projectId}`, {
            headers: { authorization: `Bearer ${token}` },
          }),
          axios.get(
            `http://localhost:8000/api/v1/getuserinproject/${projectId}`,
            {
              headers: { authorization: `Bearer ${token}` },
            }
          ),
          axios.get(`http://localhost:8000/api/v1/gettask/${projectId}`, {
            headers: { authorization: `Bearer ${token}` },
          }),
        ]);

        setMessages((prev) => ({ ...prev, [projectId]: msgRes.data.messages }));
        console.log("usrRes.data.getuser.user", usrRes.data.getuser.user);
        setUserinproject(usrRes.data.getuser.user);
        setTask((prev) => ({
          ...prev,
          [projectId]: taskRes.data.projecttask.task,
        }));
        setIsMember(true);
      } catch (err) {
        console.error("Fetch error:", err);
        setIsMember(true); // maybe show limited view if 403
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, [projectId]);
  const gettaskes = async (projectId) => {
    if (!projectId || !user?.userWithToken._id) return;

    try {
      const res = await axios.get(
        `http://localhost:8000/api/v1/gettask/${projectId}`,
        {
          headers: { authorization: `Bearer ${token}` },
        }
      );

      const assignedTasks = res.data.projecttask.task.filter((task) =>
        task.assignedTo.some((users) => users._id === user.userWithToken._id)
      );
      const projectidofowner = res.data.projecttask.task.map((task) => {
        if (task.user == user.userWithToken._id) {
          setprojetownerId(task.user);
        }
      });

      setMytask(assignedTasks);
    } catch (err) {
      console.error("Error fetching tasks:", err);
    }
  };

  useEffect(() => {
    gettaskes();
  }, [projectId, user]);

  const getAllTask = async (projectId) => {
    if (!projectId || !user?.userWithToken._id) return;

    try {
      const res = await axios.get(
        `http://localhost:8000/api/v1/gettask/${projectId}`,
        {
          headers: { authorization: `Bearer ${token}` },
        }
      );

      const assignedTasks = res.data.projecttask.task.filter((task) =>
        task.assignedTo.some((users) => users._id === user.userWithToken._id)
      );
      const projectidofowner = res.data.projecttask.task.map((task) => {
        if (task.user == user.userWithToken._id) {
          setprojetownerId(task.user);
        }
      });

      setMytask(assignedTasks);
    } catch (err) {
      console.error("Error fetching tasks:", err);
    }
  };

  console.log("task in project=>", task);

  const TaskTimer = ({ dueDate }) => {
    const [timeLeft, setTimeLeft] = useState(
      () => new Date(dueDate) - new Date()
    );

    useEffect(() => {
      const interval = setInterval(() => {
        const newTime = new Date(dueDate) - new Date();
        setTimeLeft(newTime > 0 ? newTime : 0);
      }, 1000);

      return () => clearInterval(interval);
    }, [dueDate]);

    if (timeLeft > 24 * 60 * 60 * 1000) {
      const daysLeft = Math.ceil(timeLeft / (24 * 60 * 60 * 1000));
      return (
        <span>
          📅 {daysLeft} day{daysLeft > 1 ? "s" : ""} left
        </span>
      );
    }

    const hrs = String(Math.floor(timeLeft / 3600000)).padStart(2, "0");
    const mins = String(Math.floor((timeLeft % 3600000) / 60000)).padStart(
      2,
      "0"
    );
    const secs = String(Math.floor((timeLeft % 60000) / 1000)).padStart(2, "0");

    return (
      <span>
        ⏳ {hrs}:{mins}:{secs}
      </span>
    );
  };
  console.log("projectId in chat component=>", projectId);
  console.log("above useeefect project Id and token", token, projectId);
  // useEffect(() => {
  //   console.log("projectId and token ", projectId);
  //   if (!projectId || !token) {
  //     console.log("inside useeeffect token and projectId", token, projectId);
  //     return;
  //   }

  //   if (socketRef.current) {
  //     socketRef.current.disconnect();
  //   }

  //   socketRef.current = initializeSocket(projectId, token);

  //   // ✅ Only after connection is established
  //   socketRef.current.on("connect", () => {
  //     console.log("✅ Connected to socket");
  //     socketRef.current.emit("join-project", projectId);
  //   });

  //   console.log("below connect inside useeeffect");

  //   // ✅ Listen for messages
  //   socketRef.current.on("project-message", (data) => {
  //     console.log("insdie project message");
  //     console.log("✅ Received project-message:", data);
  //     const incomingProjectId =
  //       typeof data.project === "string" ? data.project : data.project._id;

  //     setMessages((prevMessages) => ({
  //       ...prevMessages,
  //       [incomingProjectId]: [...(prevMessages[incomingProjectId] || []), data],
  //     }));
  //   });

  //   return () => {
  //     if (socketRef.current) {
  //       socketRef.current.off("project-message");
  //       socketRef.current.disconnect();
  //     }
  //   };
  // }, [projectId]);

  const send = async () => {
    if (
      (!message.trim() && !selectedFile) ||
      !user?.userWithToken._id ||
      !projectId
    )
      return;

    const formData = new FormData();
    formData.append("message", message);
    formData.append("userId", user?.userWithToken._id);
    if (selectedFile) formData.append("file", selectedFile);

    const tempId = uuidv4(); // Unique ID for tracking
    const tempFileUrl = selectedFile ? URL.createObjectURL(selectedFile) : null;

    const optimisticMessage = {
      _id: tempId,
      message,
      file: tempFileUrl,
      user: {
        _id: user.userWithToken._id,
        username: user.userWithToken.username,
        email: user.userWithToken.email,
      },
      project: projectId,
      createdAt: new Date(),
      isUploading: !!selectedFile,
    };

    // Optimistically add message
    setMessages((prevMessages) => ({
      ...prevMessages,
      [projectId]: [...(prevMessages[projectId] || []), optimisticMessage],
    }));

    setMessage("");
    setSelectedFile(null);

    try {
      const response = await axios.post(
        `http://localhost:8000/api/v1/message/${projectId}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const realMessage = response.data.newMessage;

      // Replace optimistic with real message using tempId
      setMessages((prevMessages) => {
        const updated = (prevMessages[projectId] || []).map((msg) =>
          msg._id === tempId ? realMessage : msg
        );
        return { ...prevMessages, [projectId]: updated };
      });

      // sendMessage("project-message", realMessage);
      socketRef.current.emit("project-message", realMessage);

      scrollToBottom();
    } catch (error) {
      console.error("❌ Error sending message:", error);
    }
  };

  const onSubmit = async (data) => {
    try {
      const today = new Date();
      const dueDate = new Date(data.dueDate);

      if (dueDate <= today) {
        Swal.fire({
          icon: "error",
          title: "Invalid Due Date",
          text: "Due date must be future date",
        });
        return;
      }
      console.log("data in modal", data);
      const finaldata = {
        ...data,
        assignedTo,
      };
      const res = await axios.post(
        `http://localhost:8000/api/v1/createtask/${projectId}`,
        finaldata,
        { headers: { authorization: `Bearer ${token}` } }
      );
      console.log("res in modal=>", res);
      setTask((prevtask) => ({
        ...prevtask,
        [projectId]: [...(prevtask[projectId] || []), res.data.newTask],
      }));
      if (res.status === 200 || res.status === 201) {
        Swal.fire({
          title: "Success!",
          text: "Task created successfully 🎉",
          icon: "success",
          confirmButtonColor: "#7C3AED", // violet brand colour
          timer: 1800, // auto‑close after 1.8s
          showConfirmButton: false, // hide “OK” if you’re using timer
        });
      }
      reset();
      setIsModalOpen(false);
      const gettasks = await axios.get(
        `http://localhost:8000/api/v1/gettask/${projectId}`,
        {
          headers: { authorization: `Bearer ${token}` },
        }
      );
      console.log("getting tasks", gettasks.data.projecttask.task);
      setTask((prevtask) => ({
        ...prevtask,
        [projectId]: gettasks.data.projecttask.task,
      }));
    } catch (error) {
      console.error("Error creating task:", error);
    }
  };

  const seletedtask = async (taskId, status, isVerifiedByOwner = undefined) => {
    try {
      const payload = { status, userId: user._id };
      if (isVerifiedByOwner !== undefined) {
        payload.isVerifiedByOwner = isVerifiedByOwner;
      }

      const res = await axios.put(
        `http://localhost:8000/api/v1/updatetask/${taskId}`,
        payload,
        {
          headers: { authorization: `Bearer ${token}` },
        }
      );

      const gettasks = await axios.get(
        `http://localhost:8000/api/v1/gettask/${projectId}`,
        {
          headers: { authorization: `Bearer ${token}` },
        }
      );
      setTask((prevtask) => ({
        ...prevtask,
        [projectId]: gettasks.data.projecttask.task,
      }));
    } catch (err) {
      console.error("Error updating task:", err);
    }
  };

  useEffect(() => {
    if (!projectId || !token) return;

    socketRef.current = io("http://localhost:8000", {
      auth: { token },
      query: { projectId },
    });

    socketRef.current.on("connect", () => {
      console.log("✅ Connected to socket");
      socketRef.current.emit("join-project", projectId);
    });

    socketRef.current.on("project-message", (data) => {
      const incomingProjectId =
        typeof data.project === "string" ? data.project : data.project._id;
      setMessages((prev) => ({
        ...prev,
        [incomingProjectId]: [...(prev[incomingProjectId] || []), data],
      }));
    });

    socketRef.current.on("usertyping", ({ username }) => {
      setTypingUsers((prev) =>
        prev.includes(username) ? prev : [...prev, username]
      );
    });

    socketRef.current.on("userStopTyping", ({ username }) => {
      setTypingUsers((prev) => prev.filter((name) => name !== username));
    });

    return () => {
      socketRef.current.disconnect();
    };
  }, [projectId, token]);

  // useEffect(() => {
  //   socketRef.current = io("http://localhost:8000", {
  //     query: { projectId },
  //     auth: {
  //       token: user?.userWithToken?.token,
  //     },
  //   });
  //   return () => {
  //     socketRef.current.disconnect();
  //   };
  // },[projectId, user?.userWithToken?.token]);

  const handleTyping = (e) => {
    if (!socketRef.current || !projectId || !user) return;

    socketRef.current.emit("usertyping", {
      username: user.userWithToken.username,
      projectId,
    });

    if (typingtimeoutref.current) clearTimeout(typingtimeoutref.current);
    typingtimeoutref.current = setTimeout(() => {
      socketRef.current.emit("userStopTyping", {
        username: user.userWithToken.username,
        projectId,
      });
    }, 1000);
  };

  // useEffect(() => {
  //   if (!socketRef.current) return;
  //   socketRef.current.on("usertyping", ({ username }) => {
  //     setTypingUsers((prev) => {
  //       if (prev.includes(username)) return prev;
  //       return [...prev, username];
  //     });
  //   });
  //   socketRef.current.on("userStopTyping", ({ username }) => {
  //     setTypingUsers((prev) => prev.filter((name) => name !== username));
  //   });
  // });

  const itemHeights = useRef({});
  const rowRefs = useRef({});

  const getItemSize = (index) => {
    return itemHeights.current[index] || 1000; // a safe fallback
  };

  const messagesForProject = messages[projectId] || [];

  // const processedItems = [];
  let lastDate = null;

  const processedItems = useMemo(() => {
    const items = [];
    let lastDate = null;

    (messages[projectId] || []).forEach((msg) => {
      const msgDate = moment(msg.createdAt).format("YYYY-MM-DD");
      if (msgDate !== lastDate) {
        items.push({ type: "date", date: msgDate });
        lastDate = msgDate;
      }
      items.push({ type: "message", data: msg });
    });

    return items;
  }, [messages, projectId]);

  useEffect(() => {
    if (listRef.current) {
      listRef.current.resetAfterIndex(0, true);
    }
  }, [processedItems]);

  const scrollToBottom = () => {
    const container = listRef.current?._outerRef;
    const lastRow = rowRefs.current[processedItems.length - 1];

    if (container && lastRow) {
      const bottom = lastRow.offsetTop + lastRow.offsetHeight;
      container.scrollTop = bottom;
    }
  };

  return (
    <div>
      <ProjectDashboard
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        projects={projects}
        projectId={projectId}
        selectProject={selectProject}
        user={userWithToken}
        userinproject={userinproject}
        showtask={showtask}
        scrollToBottom={scrollToBottom}
        setshowtask={setshowtask}
        showEditor={showEditor}
        setShowEditor={setShowEditor}
        isMember={isMember}
        message={message}
        setMessage={setMessage}
        handleTyping={handleTyping}
        send={send}
        setIsModalOpen={setIsModalOpen}
        task={task}
        seletedtask={seletedtask}
        listRef={listRef}
        processedItems={processedItems}
        getItemSize={getItemSize}
        typingUsers={typingUsers}
        isModalOpen={isModalOpen}
        handleSubmit={handleSubmit}
        onSubmit={onSubmit}
        register={register}
        assignedTo={assignedTo}
        handletoggle={handletoggle}
        CollaborativeEditor={CollaborativeEditor}
        moment={moment}
        hljs={hljs}
        rowRefs={rowRefs}
        itemHeights={itemHeights}
        selectedFile={selectedFile}
        setSelectedFile={setSelectedFile}
        projetownerId={projetownerId}
        getAllTask={getAllTask}
      />
      {/* <FileExplorer projectId={projectId}/> */}
    </div>
  );
}

export default Chat;
