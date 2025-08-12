import React, { useEffect, useState } from "react";
import ReactFlow, { Controls, Background, MiniMap } from "reactflow";
import "reactflow/dist/style.css";
import axios from "axios";
import Loader from "./Loader";
import Swal from "sweetalert2";

const Commit = ({ projectId }) => {
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // useEffect(() => {
  //   const fetchCommits = async () => {
  //     setLoading(true); // Show loader immediately
  //     setHasError(false); // Reset error state
  //     setErrorMessage(""); // Clear previous messages

  //     try {
  //       const res = await axios.get(
  //         `http://localhost:8000/api/v1/project/${projectId}/commits`
  //       );
  //       const commits = res.data.commits;

  //       const commitNodes = commits.map((commit, index) => ({
  //         id: commit.sha,
  //         data: {
  //           label: (
  //             <div className="p-2 text-xs text-black">
  //               <strong>{commit.commit.message.split("\n")[0]}</strong>
  //               <br />
  //               <em>{commit.commit.author.name}</em>
  //               <br />
  //               <span className="text-[10px] text-gray-700">
  //                 {new Date(commit.commit.author.date).toLocaleString()}
  //               </span>
  //               <br />
  //               <a
  //                 href={commit.html_url}
  //                 className="text-blue-600 underline"
  //                 target="_blank"
  //                 rel="noreferrer"
  //               >
  //                 View
  //               </a>
  //             </div>
  //           ),
  //         },
  //         position: { x: 200, y: index * 180 },
  //         style: {
  //           width: 280,
  //           backgroundColor: "#e6f2ff",
  //           border: "1px solid #007bff",
  //           borderRadius: 8,
  //         },
  //       }));

  //       const commitEdges = commits.slice(1).map((commit, i) => ({
  //         id: `e${i}-${i + 1}`,
  //         source: commits[i].sha,
  //         target: commit.sha,
  //         type: "smoothstep",
  //         animated: true,
  //         style: { stroke: "#007bff" },
  //       }));

  //       setNodes(commitNodes);
  //       setEdges(commitEdges);
  //     } catch (err) {
  //       const msg = err?.response?.data?.msg || "Something went wrong!";
  //       setHasError(true);
  //       setErrorMessage(msg);
  //     } finally {
  //       setLoading(false); // Stop loader regardless of success or failure
  //     }
  //   };

  //   fetchCommits();
  // }, [projectId]);

  useEffect(() => {
    const fetchCommits = async () => {
      setLoading(true);
      setHasError(false);
      setErrorMessage("");

      try {
        const res = await axios.get(
          `http://localhost:8000/api/v1/project/${projectId}/commits`
        );
        console.log("res in commit=>",res.data);
        const commits = res.data.commits;

        const commitNodes = commits.map((commit, index) => ({
          id: commit.sha,
          data: {
            label: (
              <div className="p-2 text-xs text-black">
                <strong>{commit.commit.message.split("\n")[0]}</strong>
                <br />
                <em>{commit.commit.author.name}</em>
                <br />
                <span className="text-[10px] text-gray-700">
                  {new Date(commit.commit.author.date).toLocaleString()}
                </span>
                <br />
                <a
                  href={commit.html_url}
                  className="text-blue-600 underline"
                  target="_blank"
                  rel="noreferrer"
                >
                  View
                </a>
              </div>
            ),
          },
          position: { x: 200, y: index * 180 },
          style: {
            width: 280,
            backgroundColor: "#e6f2ff",
            border: "1px solid #007bff",
            borderRadius: 8,
          },
        }));

        const commitEdges = commits.slice(1).map((commit, i) => ({
          id: `e${i}-${i + 1}`,
          source: commits[i].sha,
          target: commit.sha,
          type: "smoothstep",
          animated: true,
          style: { stroke: "#007bff" },
        }));

        setNodes(commitNodes);
        setEdges(commitEdges);
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
    <div
      style={{ width: "100%", height: "500px" }}
      className="rounded-lg overflow-hidden border border-gray-600 bg-zinc-800"
    >
      {loading ? (
        <div className="w-full h-full flex items-center justify-center">
          <Loader />
        </div>
      ) : hasError ? (
        <div className="p-6 text-center text-red-600 font-semibold">
          ❌ Failed to load commits.
          <br />
          {errorMessage}
        </div>
      ) : (
        <ReactFlow
          nodes={nodes}
          edges={edges}
          fitView
          panOnDrag={true}
          zoomOnScroll={true}
          zoomOnPinch={true}
          panOnScroll
        >
          <MiniMap
            nodeColor={() => "#007bff"}
            nodeStrokeWidth={2}
            zoomable
            pannable
          />
          <Controls showInteractive={true} />
          <Background variant="dots" gap={12} size={1} />
        </ReactFlow>
      )}
    </div>
  );
};

export default Commit;
