import React, { useEffect } from "react";
import { useStandup } from "../../context/StandupContext.js"

function StandupManager({ socket }) {
  const { currentSpeaker, setCurrentSpeaker, timeLeft, setTimeLeft } = useStandup();
  console.log("object currentSpeaker=>", currentSpeaker);
  console.log("object timeLeft=>", timeLeft);
  console.log("object socket=>", socket);

  useEffect(() => {
    socket.on("standup-turn", ({ userId, time }) => {
      setCurrentSpeaker(userId);
      setTimeLeft(time);
    });

    socket.on("standup-ended", () => {
      setCurrentSpeaker(null);
      setTimeLeft(0);
      alert("✅ Standup finished!");
    });

    socket.on("standup-error", (msg) => {
      alert(`⚠️ ${msg}`);
    });

    return () => {
      socket.off("standup-turn");
      socket.off("standup-ended");
      socket.off("standup-error");
    };
  }, [socket, setCurrentSpeaker, setTimeLeft]);

  // Timer countdown
  useEffect(() => {
    if (timeLeft <= 0) return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [timeLeft]);

  return (
    <div className="bg-gray-900 text-white p-4 rounded shadow-lg">
      {currentSpeaker ? (
        <div>
          <h2 className="text-2xl font-bold mb-2">🎤 {currentSpeaker}'s Turn</h2>
          <p className="text-lg">⏳ {timeLeft}s remaining</p>
        </div>
      ) : (
        <p>No standup in progress</p>
      )}
    </div>
  );
}

export default StandupManager;
