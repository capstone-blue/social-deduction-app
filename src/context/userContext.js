import React, { createContext, useContext, useState } from 'react';

const UserContext = createContext();

function UserProvider(props) {
  const [userId, setUserId] = useState(null);
  const value = [userId, setUserId];
  return <UserContext.Provider value={value} {...props} />;
}

function useUserId() {
  const context = useContext(UserContext);
  if (!context) throw new Error('useUser must be used within a UserProvider');

  return context;
}

export { UserProvider, useUserId };
