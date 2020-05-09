import React from 'react';
import ReactDOM from 'react-dom';
import { UserProvider } from './context/userContext';
import { LobbyProvider } from './context/lobbyContext';
import App from './App';

ReactDOM.render(
  <UserProvider>
    <LobbyProvider>
      <App />
    </LobbyProvider>
  </UserProvider>,
  document.getElementById('root')
);
