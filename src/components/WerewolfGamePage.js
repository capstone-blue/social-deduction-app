import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import {
  useListVals,
  useObject,
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

const CardActive = styled(CommonCardStyles)`
  border: 2px solid green;
`;
const CardInactive = styled(CommonCardStyles)``;

const Board = styled(Container)`
  width: 80%;
  padding: 1rem;
  margin-bottom: 1rem;
  border-radius: 0.25rem;
  background-color: gray;
`;

async function werewolfTurn(gameRef) {
  const werewolfList = [];
  await gameRef
    .child('players')
    .orderByChild('startingRole/name')
    .equalTo('Werewolf')
    .once('value', function (werewolfSnaps) {
      werewolfSnaps.forEach((w) => {
        werewolfList.push(w);
      });
    });
  console.log(werewolfList);
  if (werewolfList.length > 1) {
    console.log('2 werewolves');
    const messageContent = `
~Secret Message~
There are two of you...
${werewolfList[0].val().alias} and ${werewolfList[1].val().alias}
    `;
    const newMessageRef = await gameRef.child('messages').push();
    newMessageRef.child('contents').set(messageContent);
    werewolfList.forEach((w) => {
      const updates = {};
      updates[`${w.key}/${newMessageRef.key}`] = true;
      gameRef.child('userMessages').update(updates);
    });
  } else {
    console.log('1 werewolf');
    werewolfList.forEach((w) => console.log(w.key));
  }
  return werewolfList;
}

//* WerewolfGamePage *//
function WerewolfGamePage({ match }) {
  // Id
  const [userId] = useUserId();
  // Reference
  const [gameSessionRef] = useState(
    db.ref('/gameSessions').child(match.params.id)
  );
  // Listeners
  const [currPlayer, loadingCurrPlayer] = useObjectVal(
    gameSessionRef.child(`players/${userId}`)
  );
  const [host, loadingHost] = useObjectVal(
    gameSessionRef.child('players').orderByChild('host').equalTo(true)
  );
  const [currentTurn, loadingCurrentTurn] = useObjectVal(
    gameSessionRef.child('currentTurn')
  );
  // State - should only influence current user's own screen
  const [initialGameState, setGameState] = useState(null);
  const [currPlayerRole, setCurrPlayerRole] = useState('');
  const [selectedCards, setSelectedCards] = useState([]);
  const [isRevealed, setIsRevealed] = useState(false);
  console.log(selectedCards);

  function revealCard() {
    isRevealed ? setIsRevealed(false) : setIsRevealed(true);
  }

  async function swapCards() {
    const [firstCard, secondCard] = selectedCards;
    const { cardRef: firstRef, cardVal: firstVal } = firstCard;
    const { cardRef: secondRef, cardVal: secondVal } = secondCard;

    firstRef.set(secondVal);
    secondRef.set(firstVal);

    setSelectedCards([
      { ...firstCard, cardVal: secondVal },
      { ...secondCard, cardVal: firstVal },
    ]);
  }
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

  // Background actions for individual roles
  useEffect(() => {
    async function getWerewolves() {
      const werewolfList = await werewolfTurn(gameSessionRef);
      console.log(werewolfList);
    }
    if (currentTurn === 'Werewolf' && currPlayerRole === 'Werewolf') {
      console.log('GET WEREWOLVES');
      getWerewolves();
    }
  }, [gameSessionRef, currentTurn, currPlayerRole]);

  // View
  return !initialGameState ||
    loadingHost ||
    loadingCurrentTurn ||
    loadingCurrPlayer ? (
    <Spinner animation="border" role="status" />
  ) : (
    <Container>
      <Row>
        <Col md={10}>
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
          <Board
            style={
              currPlayer.startingRole.name === currentTurn
                ? { backgroundColor: 'gold' }
                : {}
            }
          >
            <OpponentList
              gameRef={gameSessionRef}
              players={initialGameState.players}
              setSelectedCards={setSelectedCards}
              selectedCards={selectedCards}
              isRevealed={isRevealed}
            />
            <MiddleCardList
              gameRef={gameSessionRef}
              setSelectedCards={setSelectedCards}
              selectedCards={selectedCards}
              centerCards={initialGameState.centerCards}
              isRevealed={isRevealed}
            />
          </Board>
          <Row>
            <Col>
              <Messages gameRef={gameSessionRef} />
            </Col>
            <Col>
              <PlayerCard
                currPlayer={currPlayer}
                userId={userId}
                setCurrPlayerRole={setCurrPlayerRole}
                setSelectedCards={setSelectedCards}
                selectedCards={selectedCards}
              />
            </Col>
            <Col>
              <ResetForm gameRef={gameSessionRef} />
            </Col>
          </Row>
        </Col>
        <Col md={2}>
          <aside className="text-center">
            <h2>Commands</h2>
            <Button variant="warning" onClick={revealCard}>
              Reveal Card
            </Button>
            <Button variant="warning" onClick={swapCards}>
              Swap Cards
            </Button>
          </aside>
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
function OpponentList({
  gameRef,
  setSelectedCards,
  selectedCards,
  players,
  isRevealed,
}) {
  const [userId] = useUserId();
  const [opponents, setOpponents] = useState(null);
  // filter current user out of list
  useEffect(() => {
    setOpponents(Object.entries(players).filter((p) => p[0] !== userId));
  }, [players, userId]);

  return !opponents ? (
    ''
  ) : (
    <Row className="justify-content-md-center">
      {opponents.map((o) => {
        const [opponentId, opponentData] = o;
        return (
          <OpponentCard
            gameRef={gameRef}
            key={opponentId}
            alias={opponentData.alias}
            opponentId={opponentId}
            setSelectedCards={setSelectedCards}
            selectedCards={selectedCards}
            isRevealed={isRevealed}
          />
        );
      })}
    </Row>
  );
}

function OpponentCard({
  gameRef,
  opponentId,
  alias,
  setSelectedCards,
  selectedCards,
  isRevealed,
}) {
  const playerRef = gameRef.child(`players/${opponentId}/actualRole`);
  const [cardSnap, loadingcardSnap] = useObject(playerRef);
  return loadingcardSnap ? (
    ''
  ) : (
    <div className="text-center">
      <Badge pill variant="info">
        {alias}
      </Badge>
      <SelectableCard
        setSelectedCards={setSelectedCards}
        selectedCards={selectedCards}
        isRevealed={isRevealed}
        cardId={opponentId}
        cardVal={cardSnap.val()}
        cardRef={playerRef}
      />
    </div>
  );
}

//* MiddleCardList *//
function MiddleCardList({
  gameRef,
  selectedCards,
  setSelectedCards,
  centerCards,
  isRevealed,
}) {
  return (
    <Row className="justify-content-md-center">
      {Object.entries(centerCards).map((c) => {
        const [cardId] = c;
        return (
          <MiddleCard
            key={cardId}
            gameRef={gameRef}
            cardId={cardId}
            setSelectedCards={setSelectedCards}
            selectedCards={selectedCards}
            isRevealed={isRevealed}
          />
        );
      })}
    </Row>
  );
}

function MiddleCard({
  gameRef,
  cardId,
  setSelectedCards,
  selectedCards,
  isRevealed,
}) {
  const centerCardRef = gameRef.child(`centerCards/${cardId}`);
  const [cardSnap, loadingcardSnap] = useObject(centerCardRef);
  return loadingcardSnap ? (
    ''
  ) : (
    <SelectableCard
      setSelectedCards={setSelectedCards}
      selectedCards={selectedCards}
      isRevealed={isRevealed}
      cardId={cardId}
      cardVal={cardSnap.val()}
      cardRef={centerCardRef}
    />
  );
}

//* Selectable Card//
function SelectableCard({
  setSelectedCards,
  selectedCards,
  isRevealed,
  cardId,
  cardVal,
  cardRef,
}) {
  const [isSelected, setIsSelected] = useState(false);
  const [isPeeked, setIsPeeked] = useState(false);
  const toggleSelected = () => setIsSelected(!isSelected);

  useEffect(() => {
    if (isSelected && isRevealed) {
      setIsPeeked(true);
    } else {
      setIsPeeked(false);
    }
  }, [isSelected, isPeeked, isRevealed]);

  function handleClick() {
    toggleSelected();
    if (!isSelected) {
      setSelectedCards([...selectedCards, { cardId, cardVal, cardRef }]);
    } else {
      const listWithoutThisCard = selectedCards.filter(
        (c) => c.cardId !== cardId
      );
      setSelectedCards(listWithoutThisCard);
    }
  }

  return (
    <div className="text-center" onClick={handleClick}>
      {isSelected ? (
        isPeeked ? (
          <CardActive>
            <Card.Title>{cardVal.name}</Card.Title>
          </CardActive>
        ) : (
          <CardActive>
            <Card.Title>?</Card.Title>
          </CardActive>
        )
      ) : isPeeked ? (
        <CardInactive>
          <Card.Title>{cardVal.name}</Card.Title>
        </CardInactive>
      ) : (
        <CardInactive>
          <Card.Title>?</Card.Title>
        </CardInactive>
      )}
    </div>
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
        setMessageSnaps([]);
        messageIdSnaps.forEach((messageIdSnap) => {
          const messageId = messageIdSnap.key;
          gameRef
            .child(`messages/${messageId}`)
            .once('value', function (messageSnap) {
              // the setState must take in the prev state or else it won't update properly
              setMessageSnaps((prevMessages) => {
                return [...prevMessages, messageSnap];
              });
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
function PlayerCard({ userId, currPlayer, setCurrPlayerRole }) {
  useEffect(() => {
    setCurrPlayerRole(currPlayer.startingRole.name);
  }, [setCurrPlayerRole, currPlayer.startingRole.name]);

  return (
    <div className="text-center">
      <Badge pill variant="success" className="text-center">
        {currPlayer.alias}
      </Badge>
      <Card>
        <Card.Title className="text-center">
          <div>{currPlayer.startingRole.name}</div>
        </Card.Title>
        <Card.Body>
          <div>
            {currPlayer.startingRole.options.map((o, i) => (
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
