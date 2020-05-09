import React, { createContext, useContext, useState } from 'react';

const LobbyContext = createContext();

function LobbyProvider(props) {
  const value = useState('');
  return <LobbyContext.Provider value={value} {...props} />;
}

function useLobby() {
  const context = useContext(LobbyContext);
  if (!context) throw new Error('useLobby must be used within a LobbyProvider');
  return context;
}

export { LobbyProvider, useLobby };
