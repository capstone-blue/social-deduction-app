import React, { useEffect, useState } from 'react';
import { db } from '../../firebase';
import { useUserId } from '../../context/userContext';
import styled from 'styled-components';
import Container from 'react-bootstrap/Container';
import Button from 'react-bootstrap/Button';
import Spinner from 'react-bootstrap/Spinner';
import { useObjectVal } from 'react-firebase-hooks/database';
import UIfx from 'uifx';
import startSound from '../../assets/sounds/start.mp3';

const start = new UIfx(startSound, {
  volume: 0.3,
  throttleMs: 50,
});

const StartButton = styled(Button)`
  font-size: 2rem;
`;

function GameStart({ match, players, history }) {
  const [userId] = useUserId();
  const [lobbyId] = useState(match.params.id);
  const [lobbiesRef] = useState(db.ref(`/lobbies/${lobbyId}`));
  const [minPlayers] = useState(2);
  const [isHost, setIsHost] = useState(false);
  const [gameRules] = useObjectVal(db.ref().child('games').child('werewolf'));

  useEffect(() => {
    function listenOnLobby() {
      try {
        lobbiesRef
          .child('status')
          .once('value')
          .then(function (snapshot) {
            if (snapshot.val() === 'started') {
              history.push(`/gameSessions/${lobbyId}`);
            }
          });
      } catch (e) {
        // console.error('Error in GameStart lobby listener', e.message);
      }
    }
    function checkIfHost() {
      const currentPlayer = players.find((player) => player[0] === userId);
      if (currentPlayer[1].host) {
        setIsHost(true);
      }
    }
    listenOnLobby();
    checkIfHost();
  }, [lobbiesRef, players, userId, history, lobbyId]);

  function createGameSession() {
    // checks for min players to start game
    if (players.length >= minPlayers) {
      try {
        start.play();
        // creates a game session by transferring lobby members data over
        db.ref(`/gameSessions/${lobbyId}`);
        db.ref(`/gameSessions`).update({ [lobbyId]: gameRules });
        players.forEach((player) => {
          const [playerId, playerProps] = player;
          db.ref(`/gameSessions/${lobbyId}/players`)
            .child(`${playerId}`)
            .set(playerProps);
        });
        // set lobby status from pending to started so component will render redirect to game session from the lobby listener
        lobbiesRef.update({ status: 'started' });
      } catch (e) {
        // console.error('Error in createGameSession', e.message);
      }
    } else {
      alert(
        `${minPlayers - players.length} more players required to start a game`
      );
    }
  }

  return (
    <Container>
      {isHost ? (
        <StartButton variant="danger" onClick={createGameSession}>
          Start Game
        </StartButton>
      ) : (
        <Container>
          <Button variant="dark" disabled>
            Waiting for host{' '}
            <Spinner
              as="span"
              animation="grow"
              size="sm"
              role="status"
              aria-hidden="true"
            />{' '}
          </Button>
        </Container>
      )}
    </Container>
  );
}

export default GameStart;
