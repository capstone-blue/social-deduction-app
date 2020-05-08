import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { useUser } from '../context/userContext';

function HomePage() {
  return (
    <div>
      <LobbyForm />
    </div>
  );
}

function LobbyForm() {
  const [lobbiesRef, setLobbiesRef] = useState('');
  const [currUser] = useUser();
  const [lobbyName, setLobbyName] = useState('');

  // setup references in a useEffect
  useEffect(() => {
    setLobbiesRef(db.ref().child('lobbies'));
  }, [setLobbiesRef]);

  // another useEffect can be used for listening on events for views

  async function createLobby() {
    const lobbyRef = await lobbiesRef.push({ name: lobbyName });
    await db.ref(`/lobbyHosts/${lobbyRef.key}`).set({ [currUser.key]: true });
    setLobbyName('');
  }

  async function joinLobby() {
    const lobby = await lobbiesRef
      .orderByChild('name')
      .equalTo(lobbyName)
      .once('value');
    lobby.forEach((l) => {
      db.ref(`/lobbyMembers/${l.key}`).update({ [currUser.key]: true });
      return true;
    });
    setLobbyName('');
  }

  return (
    <div>
      <h2>Lobby Name</h2>
      <input
        type="text"
        onChange={(e) => setLobbyName(e.target.value)}
        value={lobbyName}
      />
      <button type="button" onClick={joinLobby}>
        Join Lobby
      </button>
      <button type="button" onClick={createLobby}>
        Create Lobby
      </button>
    </div>
  );
}

export default HomePage;
