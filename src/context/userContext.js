import React, { createContext, useContext, useState, useMemo } from 'react';

const UserContext = createContext();

function UserProvider(props) {
  const [user, setUser] = useState({});
  const value = useMemo(() => [user, setUser], [user]);
  return <UserContext.Provider value={value} {...props} />;
}

function useUser() {
  const context = useContext(UserContext);
  if (!context) throw new Error('useUser must be used within a UserProvider');

  return context;
}

export { UserProvider, useUser };
