import React, { createContext, useContext, useState } from 'react';

type MicrophoneContextType = {
  isUpdating: boolean;
  setIsUpdating: (value: boolean) => void;
};

const MicrophoneContext = createContext<MicrophoneContextType>({
  isUpdating: false,
  setIsUpdating: () => {},
});

export const useMicrophoneContext = () => useContext(MicrophoneContext);

export const MicrophoneProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [isUpdating, setIsUpdating] = useState(false);

  return (
    <MicrophoneContext.Provider value={{ isUpdating, setIsUpdating }}>
      {children}
    </MicrophoneContext.Provider>
  );
};
