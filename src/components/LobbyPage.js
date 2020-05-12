import React, { useEffect, useState } from 'react';
import { db } from '../firebase';
import { useObjectVal } from 'react-firebase-hooks/database';
import { useUserId } from '../context/userContext';
import { BrowserRouter as Redirect } from 'react-router-dom';

// Main logic should be handled in this component
function LobbyPage({ match, history }) {
  const [lobbiesRef] = useState(db.ref().child('lobbies'));
  const [lobby, lobbyLoading] = useObjectVal(lobbiesRef.child(match.params.id));
  const [gameStarted, setGameStarted] = useState(false)


  return lobbyLoading ? (
    <div>...Loading</div>
  ) : (
      <div>
        <AliasModal match={match} />
        <LobbyView players={Object.entries(lobby.players)} name={lobby.name} />
        <GameStart players={Object.entries(lobby.players)} match={match} history={history} setGameStarted={setGameStarted} gameStarted={gameStarted} />
      </div>
    );
}

function LobbyView({ name, players }) {
  const [host, setHost] = useState({});
  const [members, setMembers] = useState([]);
  useEffect(() => {
    const m = [];
    let h = {};

    players.forEach((playerEntry) => {
      const [, player] = playerEntry;
      if (player.host) h = player;
      else m.push(playerEntry);
    });

    setHost(h);
    setMembers(m);
  }, [players]);

  return (
    <div>
      <h1>Lobby</h1>
      <h2>{name}</h2>
      <div>
        <h3>host</h3>
        <div>{host.alias ? host.alias : '(...)'}</div>
      </div>
      <div>
        <h3>members</h3>
        <div>
          {members.map((m) => {
            const [id, player] = m;
            return <div key={id}>{player.alias ? player.alias : '(...)'}</div>;
          })}
        </div>
      </div>
    </div>
  );
}

function AliasModal({ match }) {
  const [userId] = useUserId();
  const [alias, setAlias] = useState('');

  function handleSubmit(e) {
    e.preventDefault();
    const lobbyId = match.params.id;
    const updates = {
      [`users/${userId}/alias`]: alias,
      [`lobbies/${lobbyId}/players/${userId}/alias`]: alias,
    };
    db.ref().update(updates);
  }

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={alias}
          onChange={(e) => setAlias(e.target.value)}
        />
        <button type="submit">submit</button>
      </form>
    </div>
  );
}


function GameStart({ match, players, history, }) {
  const [userId] = useUserId();
  const [lobbiesRef] = useState(db.ref(`/lobbies/${match.params.id}`));
  // const [currentUser] = useState(lobbiesRef.child(`${userId}`))
  const [minPlayers] = useState(2)
  const [isHost, setIsHost] = useState(false)
  const [started, setStarted] = useState('pending')



  useEffect(() => {
    async function listenOnLobby() {
      try {
        lobbiesRef.child('status').once('value').then(function (snapshot) {
          setStarted(snapshot.val())
        })
      } catch (e) {
        console.error('Error in GameStart lobby listener', e.message)
      }
    }
    function checkIfHost() {
      const currentPlayer = players.find(player => player[0] === userId)
      if (currentPlayer[1].host) {
        setIsHost(true)
      }
    }
    listenOnLobby()
    checkIfHost()
  }, [lobbiesRef, players, userId])

  async function createGameSession() {
    // checks for min players to start game
    if (players.length >= minPlayers) {
      try {
        // creates a game session by transferring lobby members data over
        players.forEach(player => {
          const [playerId, playerProps] = player;
          db.ref(`/gameSessions/${match.params.id}/players`).child(`${playerId}`).set(playerProps)
        })
        // set lobby status from pending to started so component will render redirect to game session
        lobbiesRef.update({ 'status': 'started' });
      } catch (e) {
        console.error('Error in createGameSession', e.message)
      }
      // lobbiesRef.set(null)
      // history.push(`/gamesession/${match.params.id}`);
    } else {
      alert(`${minPlayers - players.length} more players required to start a game`)
    }
  }

  return (
    <div>
      {isHost ? <button onClick={createGameSession}>Start Game</button> : <p>Waiting for host...</p>}
      {started === 'started' ? history.push(`/gamesession/${match.params.id}`) : null}
    </div>
  )
}

export default LobbyPage;
