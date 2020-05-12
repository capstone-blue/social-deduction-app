import React, { useState } from 'react';
import { db } from '../firebase';
import { useObject } from 'react-firebase-hooks/database';
import { useUserId } from '../context/userContext';

function HomePage(props) {
  return (
    <div>
      <LobbyForm {...props} />
    </div>
  );
}

function LobbyForm({ history }) {
  const [lobbiesRef] = useState(db.ref().child('lobbies'));
  const [usersRef] = useState(db.ref().child('users'));

  const [lobbyName, setLobbyName] = useState('');
  const [userId] = useUserId();
  const [userSnap, userLoading] = useObject(usersRef.child(userId));

  async function createLobby() {
    try {
      const lobbySnap = await lobbiesRef.push({
        name: lobbyName,
        players: { [userSnap.key]: { ...userSnap.val(), host: true } },
      });
      setLobbyName('');
      history.push(`/lobbies/${lobbySnap.key}`);
    } catch (e) {
      console.error('Error in createLobby', e.message);
    }
  }

  async function joinLobby() {
    try {
      const lobbySnaps = await lobbiesRef
        .orderByChild('name')
        .equalTo(lobbyName)
        .once('value');
      console.log(lobbySnaps)
      if (!lobbySnaps.val()) {
        setLobbyName('');
        throw new Error(`Cannot find lobby with name ${lobbyName}`);
      }

      lobbySnaps.forEach((l) => {
        lobbiesRef
          .child(l.key)
          .child('players')
          .update({ [userSnap.key]: userSnap.val() });
        setLobbyName('');
        history.push(`/lobbies/${l.key}`);
        return true;
      });
    } catch (e) {
      console.error('Error in joinLobby', e.message);
    }
  }

  return userLoading ? (
    <div>Loading...</div>
  ) : (
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
