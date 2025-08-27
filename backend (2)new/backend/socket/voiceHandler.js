// socket/voiceHandler.js
const voiceRooms = new Map(); // Store voice room participants

const handleVoiceChat = (io, socket) => {
  // Only log once when handler is attached, not continuously
  if (!socket.voiceHandlerAttached) {
    console.log(`🎤 Voice chat handler initialized for user: ${socket.user?.username || 'Anonymous'} (${socket.id})`);
    socket.voiceHandlerAttached = true;
  }

  // Join voice room
  socket.on("voice-join", ({ projectId }) => {
    if (!projectId) return;
    
    console.log(`🎤 User ${socket.user?.username || 'Anonymous'} joining voice room: ${projectId}`);
    
    socket.join(`voice-${projectId}`);
    
    // Add user to voice room tracking
    if (!voiceRooms.has(projectId)) {
      voiceRooms.set(projectId, new Set());
    }
    
    const roomUsers = voiceRooms.get(projectId);
    const userInfo = {
      id: socket.id,
      username: socket.user?.username || 'Anonymous',
      userId: socket.user?.id || socket.id
    };
    
    roomUsers.add(userInfo);
    
    // Notify other users in the room
    socket.to(`voice-${projectId}`).emit("voice-user-joined", {
      id: socket.id,
      username: userInfo.username,
      users: Array.from(roomUsers)
    });
    
    // Send current users list to the joining user
    socket.emit("voice-users-list", {
      users: Array.from(roomUsers)
    });

    console.log(`🎤 Voice room ${projectId} now has ${roomUsers.size} users`);
  });

  // Leave voice room
  socket.on("voice-leave", ({ projectId }) => {
    console.log(`🎤 User ${socket.user?.username || 'Anonymous'} leaving voice room: ${projectId}`);
    
    socket.leave(`voice-${projectId}`);
    
    if (voiceRooms.has(projectId)) {
      const roomUsers = voiceRooms.get(projectId);
      
      // Remove user from the room
      for (let user of roomUsers) {
        if (user.id === socket.id) {
          roomUsers.delete(user);
          break;
        }
      }
      
      // Notify other users
      socket.to(`voice-${projectId}`).emit("voice-user-left", {
        id: socket.id,
        username: socket.user?.username || 'Anonymous',
        users: Array.from(roomUsers)
      });
      
      // Clean up empty rooms
      if (roomUsers.size === 0) {
        voiceRooms.delete(projectId);
        console.log(`🎤 Voice room ${projectId} cleaned up - no users remaining`);
      }
    }
  });

  // Handle WebRTC signaling - Offer
  socket.on("voice-offer", ({ offer, projectId }) => {
    // Reduced logging frequency
    socket.to(`voice-${projectId}`).emit("voice-offer", {
      offer,
      from: socket.id,
      username: socket.user?.username || 'Anonymous'
    });
  });

  // Handle WebRTC signaling - Answer
  socket.on("voice-answer", ({ answer, projectId }) => {
    // Reduced logging frequency
    socket.to(`voice-${projectId}`).emit("voice-answer", {
      answer,
      from: socket.id,
      username: socket.user?.username || 'Anonymous'
    });
  });

  // Handle WebRTC signaling - ICE Candidate
  socket.on("voice-candidate", ({ candidate, projectId }) => {
    // No logging for ICE candidates to reduce spam
    socket.to(`voice-${projectId}`).emit("voice-candidate", {
      candidate,
      from: socket.id
    });
  });

  // Handle voice mute/unmute status
  socket.on("voice-mute", ({ projectId, isMuted }) => {
    socket.to(`voice-${projectId}`).emit("voice-user-muted", {
      userId: socket.id,
      username: socket.user?.username || 'Anonymous',
      isMuted
    });
  });

  // Handle disconnect cleanup
  const handleVoiceDisconnect = () => {
    // Only log if user was actually in voice rooms
    let wasInVoiceRoom = false;
    
    // Clean up from all voice rooms
    voiceRooms.forEach((roomUsers, projectId) => {
      for (let user of roomUsers) {
        if (user.id === socket.id) {
          roomUsers.delete(user);
          wasInVoiceRoom = true;
          
          // Notify other users in the room
          socket.to(`voice-${projectId}`).emit("voice-user-left", {
            id: socket.id,
            username: socket.user?.username || 'Anonymous',
            users: Array.from(roomUsers)
          });
          
          break;
        }
      }
      
      // Clean up empty rooms
      if (roomUsers.size === 0) {
        voiceRooms.delete(projectId);
      }
    });

    if (wasInVoiceRoom) {
      console.log(`🎤 User ${socket.user?.username || 'Anonymous'} disconnected from voice`);
    }
  };

  // Register disconnect handler
  socket.on("disconnect", handleVoiceDisconnect);
};

// Utility function to get voice room statistics
const getVoiceRoomStats = () => {
  const stats = {};
  voiceRooms.forEach((users, projectId) => {
    stats[projectId] = {
      userCount: users.size,
      users: Array.from(users).map(user => ({
        id: user.id,
        username: user.username
      }))
    };
  });
  return stats;
};

// Cleanup function for production use
const cleanupInactiveVoiceRooms = () => {
  voiceRooms.forEach((users, projectId) => {
    if (users.size === 0) {
      voiceRooms.delete(projectId);
      console.log(`🧹 Cleaned up empty voice room: ${projectId}`);
    }
  });
};

module.exports = {
  handleVoiceChat,
  getVoiceRoomStats,
  cleanupInactiveVoiceRooms
};
