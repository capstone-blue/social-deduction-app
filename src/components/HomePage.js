import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { useUser } from '../context/userContext';
import { useLobby } from '../context/lobbyContext';

function HomePage(props) {
  return (
    <div>
      <LobbyForm {...props} />
    </div>
  );
}

function LobbyForm({ history }) {
  const [lobbiesRef, setLobbiesRef] = useState('');
  const [currUser] = useUser();
  const [, setLobby] = useLobby();
  const [lobbyName, setLobbyName] = useState('');

  // setup references in a useEffect
  useEffect(() => {
    setLobbiesRef(db.ref().child('lobbies'));
  }, [setLobbiesRef]);

  // another useEffect can be used for listening on events for views

  async function createLobby() {
    try {
      const lobbyRef = await lobbiesRef.push({ name: lobbyName });
      await db.ref(`/lobbyHosts/${lobbyRef.key}`).set({ [currUser.key]: true });
      setLobby(lobbyRef.key);
      setLobbyName('');
      history.push(`/lobbies/${lobbyRef.key}`);
    } catch (e) {
      console.error('Error in createLobby', e.message);
    }
  }

  async function joinLobby() {
    try {
      const lobby = await lobbiesRef
        .orderByChild('name')
        .equalTo(lobbyName)
        .once('value');
      lobby.forEach((l) => {
        db.ref(`/lobbyMembers/${l.key}`).update({ [currUser.key]: true });
        setLobby({ id: l.key });
        setLobbyName('');
        history.push(`/lobbies/${l.key}`);
        return true;
      });
    } catch (e) {
      console.error('Error in joinLobby', e.message);
    }
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
