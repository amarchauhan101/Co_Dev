import React from "react";

function StartStandupButton({ socket, projectId, userList }) {
  const startStandup = () => {
    socket.emit("start-standup", {
      users: userList.map((u) => u._id), // Pass array of user IDs
    });
  };

  return (
    <button
      onClick={startStandup}
      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
    >
      🟢 Start Daily Standup
    </button>
  );
}

export default StartStandupButton;
