import React, { useEffect, useState } from 'react';
import { db } from '../firebase';
import { useUserId } from '../context/userContext';
import { Redirect } from 'react-router-dom';

function GameStart({ match, players, history, }) {
  const [userId] = useUserId();
  const [lobbiesRef] = useState(db.ref(`/lobbies/${match.params.id}`));
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
      {/* {started === 'started' ? <Redirect push to={`/gameseession/${match.params.id}`} /> : null}
    </div> */}
      { started === 'started' ? history.push(`/gamesession/${match.params.id}`) : null}
    </div>
  )
}

export default GameStart
