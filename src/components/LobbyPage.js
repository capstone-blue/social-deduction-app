import React, { useEffect, useState } from 'react';
import { db, auth } from '../firebase';
import { useObjectVal } from 'react-firebase-hooks/database';
import { useUserId } from '../context/userContext';

// Main logic should be handled in this component
function LobbyPage({ match, history }) {
  const [lobbiesRef] = useState(db.ref().child('lobbies'));
  const [lobby, lobbyLoading] = useObjectVal(lobbiesRef.child(match.params.id));


  return lobbyLoading ? (
    <div>...Loading</div>
  ) : (
      <div>
        <AliasModal match={match} />
        <LobbyView players={Object.entries(lobby.players)} name={lobby.name} />
        <GameStart players={Object.entries(lobby.players)} match={match} history={history} />
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


function GameStart({ match, players, history }) {
  const [userId] = useUserId();
  const [lobbiesRef] = useState(db.ref(`/lobbies/${match.params.id}`));
  // const [currentUser] = useState(lobbiesRef.child(`${userId}`))
  const [minPlayers] = useState(2)
  const [gameStarted, setGameStarted] = useState(false)

  function checkIfHost() {
    const currentPlayer = players.find(player => player[0] === userId)
    return currentPlayer[1].host
  }

  async function createGameSession() {
    // checks for min players to start game
    if (players.length >= minPlayers) {
      try {
        // creates a game session by transferring lobby members data over
        players.forEach(player => {
          const [playerId, playerProps] = player;
          db.ref(`/gameSessions/${match.params.id}/players`).child(`${playerId}`).set(playerProps)
        })
      } catch (e) {
        console.error('Error in createGameSession', e.message)
      }
      // sends player to GameSession component
      history.push(`/gamesession/${match.params.id}`);
      // destroys lobby, but gets error because
      lobbiesRef.set(null)
    } else {
      alert(`${minPlayers - players.length} more players required to start a game`)
    }
  }


  return (
    <div>
      {checkIfHost() ? <button onClick={createGameSession}>Start Game</button> : <p>Waiting for host...</p>}
    </div>
  )
}

export default LobbyPage;
