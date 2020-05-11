import React, { useEffect, useState } from 'react';
import { db } from '../firebase';
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
  // https://social-deduction-test.firebaseio.com/lobbies/-M73Oor-5D-v5xYwlDAV/players
  const [lobbiesRef] = useState(db.ref(`/lobbies/${match.params.id}`));
  const [minPlayers] = useState(2)

  async function createGameSession() {
    // need to set user id as the key
    // then inside that, set the rest of the user properties
    console.log(players)
    console.log(match.params.id)
    if (players.length >= minPlayers) {
      try {
        players.forEach(player => {
          const [playerId, playerProps] = player;
          db.ref(`/gameSessions/${match.params.id}/players`).child(`${playerId}`).set(playerProps)
        })
        // < Route path = "/gamesession/:id" component = { GameSession } />

      } catch (e) {
        console.error('Error in createGameSession', e.message)
      }
      history.push(`/gamesession/${match.params.id}`);
      lobbiesRef.set(null)
    } else {
      alert(`${minPlayers - players.length} more players required to start a game`)
    }
  }


  return (
    <div>
      <button onClick={createGameSession}>Start Game</button>
    </div>
  )
}

export default LobbyPage;
