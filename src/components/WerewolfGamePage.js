import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import {
  useList,
  useListVals,
  useObjectVal,
} from 'react-firebase-hooks/database';
import { useUserId } from '../context/userContext';
import styled from 'styled-components';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Badge from 'react-bootstrap/Badge';
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import Spinner from 'react-bootstrap/Spinner';
import Form from 'react-bootstrap/Form';

const CommonCardStyles = styled(Card)`
  width: 5rem;
  min-height: 7rem;
  padding: 1rem;
  font-size: 1.5rem;
`;

const OpponentCard = styled(CommonCardStyles)``;

const MiddleCard = styled(CommonCardStyles)``;

//* WerewolfGamePage *//
function WerewolfGamePage({ match }) {
  const [gameSessionRef] = useState(
    db.ref('/gameSessions').child(match.params.id)
  );
  const [host, loadingHost] = useObjectVal(
    gameSessionRef.child('players').orderByChild('host').equalTo(true)
  );
  const [initialGameState, setGameState] = useState(null);
  console.log(initialGameState);
  const [currentTurn, loadingCurrentTurn] = useObjectVal(
    gameSessionRef.child('currentTurn')
  );
  // use 'once' to grab the initial state on load
  // firebase-hooks uses 'on', which we don't want in this case
  useEffect(() => {
    gameSessionRef.once('value', (gameSessionSnap) => {
      try {
        if (!gameSessionSnap.val())
          throw new Error('no value found in game snapshot');
        const gameState = gameSessionSnap.val();
        setGameState(gameState);
      } catch (e) {
        console.error('Error loading intitial game state, ', e.message);
      }
    });
  }, [gameSessionRef, setGameState]);

  return !initialGameState || loadingHost || loadingCurrentTurn ? (
    <Spinner animation="border" role="status" />
  ) : (
    <Container>
      <Row>
        <Col>
          <h1 className="text-center">
            {initialGameState.title}{' '}
            <Badge variant={initialGameState.isNight ? 'dark' : 'light'}>
              {initialGameState.isNight ? 'Night Phase' : 'Day Phase'}
            </Badge>
          </h1>
        </Col>
      </Row>
      <Row>
        <TurnCountdown
          gameRef={gameSessionRef}
          roles={initialGameState.turnOrder}
          host={host}
          currentTurn={currentTurn}
        />
      </Row>
      <OpponentList
        gameRef={gameSessionRef}
        opponents={initialGameState.players}
      />
      <MiddleCardList gameRef={gameSessionRef} />
      <Row>
        <Col>
          <Messages gameRef={gameSessionRef} />
        </Col>
        <Col>
          <PlayerCard gameRef={gameSessionRef} />
        </Col>
        <Col>
          <ResetForm gameRef={gameSessionRef} />
        </Col>
      </Row>
    </Container>
  );
}

export default WerewolfGamePage;

//* TurnCountdown *//
function TurnCountdown({ gameRef, host, currentTurn, setCurrentTurn }) {
  const [userId] = useUserId();
  const [count, setCount] = useState('');
  const [endTime, loadingEndTime] = useObjectVal(gameRef.child('endTime'));
  const [roleList, loadingRoleList] = useListVals(gameRef.child('turnOrder'));
  const gameHasntStarted = !loadingEndTime && !endTime;
  const countDownReached = !gameHasntStarted && endTime < new Date().getTime();

  // EFFECTS
  useEffect(() => {
    function setEndTimeInDB() {
      db.ref('/.info/serverTimeOffset').once('value', function (snap) {
        const offset = snap.val();
        const rightNow = new Date().getTime() + offset;
        const endTime = rightNow + 15000;
        gameRef.child('endTime').set(endTime);
      });
    }
    function setNextTurnInDB() {
      roleList.shift();
      gameRef.child('turnOrder').set(roleList);
      gameRef.child('currentTurn').set(roleList[0]);
    }

    if (host[userId]) {
      if (gameHasntStarted) {
        // set an expiration time for 15 seconds into the future
        setEndTimeInDB();
      } else if (countDownReached && roleList.length > 1) {
        // remove the role that just went from the turn order
        setEndTimeInDB();
        setNextTurnInDB();
      } else if (countDownReached && roleList.length === 1) {
        // the turns are done
        gameRef.child('status').set('dayPhase');
      }
    }
  }, [
    gameRef,
    host,
    userId,
    gameHasntStarted,
    countDownReached,
    setCurrentTurn,
    roleList,
  ]);

  // every second, client checks their time against server end time
  useEffect(() => {
    const interval = setInterval(() => {
      let secondsLeft = Math.floor((endTime - new Date().getTime()) / 1000);
      setCount(secondsLeft);
    }, 1000);
    return () => clearInterval(interval);
  }, [count, endTime]);

  // VIEW
  return loadingEndTime || loadingRoleList ? (
    <Spinner animation="border" role="status" />
  ) : (
    <h2>
      {currentTurn}'s Turn{' '}
      {`:${Math.floor((endTime - new Date().getTime()) / 1000)}`}
    </h2>
  );
}

//* OpponentList *//
function OpponentList({ gameRef }) {
  const [userId] = useUserId();
  const [playerSnaps, playerSnapsLoading] = useList(gameRef.child('players'));
  const [opponents, setOpponents] = useState(null);

  // filter current user out of list
  useEffect(() => {
    setOpponents(playerSnaps.filter((p) => p.key !== userId));
  }, [playerSnaps, userId]);

  return !opponents || playerSnapsLoading ? (
    ''
  ) : (
    <Row className="justify-content-md-center">
      {opponents.map((o) => (
        <div key={o.key} className="text-center">
          <Badge pill variant="info">
            {o.val().alias}
          </Badge>
          <OpponentCard>
            <Card.Title>?</Card.Title>
          </OpponentCard>
        </div>
      ))}
    </Row>
  );
}

//* MiddleCardList *//
function MiddleCardList({ gameRef }) {
  const [cardSnaps, cardSnapsLoading] = useList(gameRef.child('centerCards'));

  return cardSnapsLoading ? (
    ''
  ) : (
    <Row className="justify-content-md-center">
      {cardSnaps.map((c) => (
        <MiddleCard key={c.key}>
          <Card.Title className="text-center">?</Card.Title>
        </MiddleCard>
      ))}
    </Row>
  );
}

function Messages({ gameRef }) {
  const [userId] = useUserId();
  const [messageSnaps, setMessageSnaps] = useState([]);

  // two tables involved, userMessages for indexes and messages with metadata
  // if a new index appears for user, look up message set it in state
  useEffect(() => {
    gameRef
      .child(`userMessages/${userId}`)
      .on('value', function (messageIdSnaps) {
        messageIdSnaps.forEach((messageIdSnap) => {
          const messageId = messageIdSnap.key;
          gameRef
            .child(`messages/${messageId}`)
            .once('value', function (messageSnap) {
              // the setState must take in the prev state or else it won't update properly
              setMessageSnaps((prevMessages) => [...prevMessages, messageSnap]);
            });
        });
      });
    return () => gameRef.child(`userMessages/${userId}`).off();
  }, [gameRef, setMessageSnaps, userId]);

  return (
    <div>
      <h3>Messages</h3>
      <div>
        {messageSnaps.map((m) => {
          return (
            <div key={m.key}>
              <div>{m.val().contents}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

//* PlayerCard *//
function PlayerCard({ gameRef }) {
  const [userId] = useUserId();
  const [player, loadPlayer] = useObjectVal(gameRef.child(`players/${userId}`));
  return loadPlayer ? (
    ''
  ) : (
    <div className="text-center">
      <Badge pill variant="success" className="text-center">
        {player.alias}
      </Badge>
      <Card>
        <Card.Title className="text-center">
          <div>{player.startingRole.name}</div>
        </Card.Title>
        <Card.Body>
          <div>
            {player.startingRole.options.map((o, i) => (
              <div key={`card-${userId}-${i}`}>{o}</div>
            ))}
          </div>
        </Card.Body>
      </Card>
    </div>
  );
}

function ResetForm({ gameRef }) {
  const [userId] = useUserId();
  const [fakeUserId, setFakeUserId] = useState('');
  const [host, setHost] = useState(true);
  const [role, setRole] = useState('werewolf');
  const toggleHost = () => {
    setHost(!host);
  };

  function handleRoleSwitch(e) {
    setRole(e.target.value);
  }

  function seedDatabase(e) {
    e.preventDefault();
    db.ref(`/games/werewolf/roles/${role}`).once('value', function (roleSnap) {
      const id = fakeUserId ? fakeUserId : userId;
      const newRole = roleSnap.val();
      const updates = {
        [`players/${id}/host`]: host,
        [`players/${id}/startingRole`]: newRole,
      };
      gameRef.update(updates);
    });
  }

  function restartGame(e) {
    e.preventDefault();
    const updates = {
      turnOrder: {
        '0': 'Werewolf',
        '1': 'Seer',
        '2': 'Robber',
        '3': 'Villager',
      },
      currentTurn: 'Werewolf',
      userMessages: null,
      messages: null,
      endTime: null,
    };
    gameRef.update(updates);
  }

  return (
    <Row>
      <Col>
        <Form onSubmit={seedDatabase}>
          <div key="host" className="mb-3">
            <Form.Switch
              id="custom-switch"
              label="Make Host"
              onChange={toggleHost}
              checked={host}
            />
          </div>
          <Form.Check
            name="role"
            type="radio"
            id="custom-radio"
            label="werewolf"
            value="werewolf"
            checked={role === 'werewolf'}
            onChange={handleRoleSwitch}
          />
          <Form.Check
            name="role"
            type="radio"
            id="custom-radio"
            label="seer"
            value="seer"
            onChange={handleRoleSwitch}
          />
          <Form.Check
            name="role"
            type="radio"
            id="custom-radio"
            label="robber"
            value="robber"
            onChange={handleRoleSwitch}
          />
          <Form.Check
            name="role"
            type="radio"
            id="custom-radio"
            label="villager"
            value="villager"
            onChange={handleRoleSwitch}
          />
          <Form.Control
            onChange={(e) => setFakeUserId(e.target.value)}
            value={fakeUserId}
          />
          <Button variant="outline-primary" type="submit">
            Change Player
          </Button>
        </Form>
      </Col>
      <Col>
        <Button type="button" variant="outline-danger" onClick={restartGame}>
          Restart Game
        </Button>
      </Col>
    </Row>
  );
}
