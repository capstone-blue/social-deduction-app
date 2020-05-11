import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { useList, useObjectVal } from 'react-firebase-hooks/database';
import { useUserId } from '../context/userContext';
import styled from 'styled-components';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Badge from 'react-bootstrap/Badge';
import Card from 'react-bootstrap/Card';
import Spinner from 'react-bootstrap/Spinner';

const OpponentCard = styled(Card)`
  width: 8rem;
  min-height: 10rem;
`;

const MiddleCard = styled(Card)`
  width: 8rem;
  min-height: 10rem;
`;

function WerewolfGamePage({ match }) {
  const [gameSessionRef] = useState(
    db.ref('/gameSessions').child(match.params.id)
  );
  const [gameState, setGameState] = useState(null);
  const [count] = useState(15);

  // const decrement = () => setCount((c) => c - 1);

  // use 'once' to grab the initial state on load
  // firebase-hooks uses 'on', which we don't want in this case
  useEffect(() => {
    gameSessionRef.once('value', (gameSessionSnap) => {
      try {
        if (!gameSessionSnap.val())
          throw new Error('no value found in game snapshot');
        setGameState(gameSessionSnap.val());
      } catch (e) {
        console.error('Error loading intitial game state, ', e.message);
      }
    });
  }, [gameSessionRef, setGameState]);

  // count down timer
  // useEffect(() => {
  //   const interval = setInterval(() => {
  //     if (count > 0) {
  //       decrement();
  //     } else {
  //       setCount(15);
  //     }
  //   }, 1000);
  //   return () => clearInterval(interval);
  // }, [count]);

  return !gameState ? (
    <Spinner animation="border" role="status" />
  ) : (
    <Container>
      <Row>
        <Col>
          <h1 className="text-center">
            {gameState.title}{' '}
            <Badge variant={gameState.isNight ? 'dark' : 'light'}>
              {gameState.isNight ? 'Night Phase' : 'Day Phase'}
            </Badge>
          </h1>
        </Col>
      </Row>
      <Row>
        <h2>
          {gameState.availableRoles[0]}'s Turn {`:${count}`}
        </h2>
      </Row>
      <OpponentList gameRef={gameSessionRef} opponents={gameState.players} />
      <CenterCardList gameRef={gameSessionRef} />
      <Row>
        <Col>
          <Messages gameRef={gameSessionRef} />
        </Col>
        <Col>
          <PlayerCard gameRef={gameSessionRef} />
        </Col>
        <Col></Col>
      </Row>
    </Container>
  );
}

export default WerewolfGamePage;

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

function CenterCardList({ gameRef }) {
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

function PlayerCard({ gameRef }) {
  const [userId] = useUserId();
  const [player, loadPlayer] = useObjectVal(gameRef.child(`players/${userId}`));
  console.log(player);

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
