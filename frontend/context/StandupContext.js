import { createContext, useContext, useState } from "react";

const StandupContext = createContext();

export const StandupProvider = ({ children }) => {
  const [currentSpeaker, setCurrentSpeaker] = useState(null);
  const [timeLeft, setTimeLeft] = useState(0);

  return (
    <StandupContext.Provider value={{ currentSpeaker, timeLeft, setCurrentSpeaker, setTimeLeft }}>
      {children}
    </StandupContext.Provider>
  );
};

export const useStandup = () => useContext(StandupContext);
