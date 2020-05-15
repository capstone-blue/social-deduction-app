import React, { useEffect, useState } from 'react';
import { db } from '../firebase';
import { useObjectVal, useList, useListKeys, useObject } from 'react-firebase-hooks/database';
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
import RoleMarkerButton from './roleMarkerButton'


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




function DayTime({match}){
    const gameRef = db.ref().child('gameSessions').child(match.params.id)
    const [userId] = useUserId();

  // Listeners
  const [currPlayer, loadingCurrPlayer] = useObjectVal(
    gameRef.child(`players/${userId}`)
  );
  const [host, loadingHost] = useObjectVal(
    gameRef.child('players').orderByChild('host').equalTo(true)
  );

    // State - should only influence current user's own screen
    const [initialGameState, setGameState] = useState(null);
    const [currPlayerRole, setCurrPlayerRole] = useState('');
    const [selectedCards, setSelectedCards] = useState([]);
    const [isRevealed, setIsRevealed] = useState(false);
    function revealCard() {
        isRevealed ? setIsRevealed(false) : setIsRevealed(true);
      }

    useEffect(() => {
        gameRef.once('value', (gameSessionSnap) => {
          try {
            if (!gameSessionSnap.val())
              throw new Error('no value found in game snapshot');
            const gameState = gameSessionSnap.val();
            setGameState(gameState);
          } catch (e) {
            console.error('Error loading intitial game state, ', e.message);
          }
        });
      }, [gameRef, setGameState]);

    function skipToVote(){
        gameRef.update({"status":"voting"})
    }
    return !initialGameState ||
    loadingHost ||
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
          <DayCountdown gameRef ={gameRef}/>
          </Row>
          <Board
            style={{}}
          >
            <OpponentList
              gameRef={gameRef}
              players={initialGameState.players}
              setSelectedCards={setSelectedCards}
              selectedCards={selectedCards}
              isRevealed={isRevealed}
            />
            <MiddleCardList
              gameRef={gameRef}
              setSelectedCards={setSelectedCards}
              selectedCards={selectedCards}
              centerCards={initialGameState.centerCards}
              isRevealed={isRevealed}
            />
          </Board>
          <Row>
            <Col>
              {/* <Messages gameRef={gameRef} /> */}
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
              <ResetForm gameRef={gameRef} />
            </Col>
          </Row>
        </Col>
        <Col md={2}>
          <aside className="text-center">
            <h2>Commands</h2>
            <Button variant="warning" onClick={revealCard}>
              Reveal Card
            </Button>
            <RoleMarkerButton gameRef = {gameRef} selectedCards = {selectedCards} role = "suspected werewolf" applyMarker = {applyMarker}/>

          </aside>
        </Col>
      </Row>
    </Container>
  );
    return(
        <div>
            <h1>******placeholder Component******</h1>
            <h1>it's day time. Try to reconstruct what happened.</h1>
            <DayCountdown gameRef ={gameRef}/>
            <button onClick = {()=>skipToVote()}>
                test use only: skip to voting
            </button>
            <h1>******placeholder Component******</h1>
        </div>
        
    )
}


function DayCountdown({gameRef}) {
    const [count, setCount] = useState('');
    const [endDayTime, loadingEndTime] = useObjectVal(gameRef.child('endDayTime'));
    const gameHasntStarted = !loadingEndTime && !endDayTime;
    const countDownReached = !gameHasntStarted && endDayTime < new Date().getTime();
    const timeLeft = Math.floor(endDayTime - new Date().getTime())
    const minutes = Math.floor((timeLeft / 1000)/60)
    const seconds = Math.floor((timeLeft/1000) -((minutes)*60))
    // EFFECTS
    useEffect(() => {
      function setEndTimeInDB() {
        db.ref('/.info/serverTimeOffset').once('value', function (snap) {
          const offset = snap.val();
          const rightNow = new Date().getTime() + offset;
          const endDayTime = rightNow + 300000;
          gameRef.child('endDayTime').set(endDayTime);
        });
      } 
        if (gameHasntStarted) {
          // set an expiration time for 15 seconds into the future
          setEndTimeInDB();
        }else if (countDownReached) {
          gameRef.child('status').set('voting');
        }
    }, [
      gameRef,
      gameHasntStarted,
      countDownReached,
    ]);
  
    // every second, client checks their time against server end time
    useEffect(() => {
      const interval = setInterval(() => {
        let secondsLeft = Math.floor((endDayTime - new Date().getTime()) / 1000);
        setCount(secondsLeft);
      }, 1000);
      return () => clearInterval(interval);
    }, [count, endDayTime]);
  
    // VIEW
    return loadingEndTime ? (
      <h2>loading</h2>
    ) : (
        seconds > 9
            ?
      <h2>
        Daytime left
        {`: ${minutes}:${seconds}`}
      </h2>
            :
            <h2>
        Daytime left
        {`: ${minutes}:0${seconds}`}
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
          gameRef = {gameRef}
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
        gameRef={gameRef}
        setSelectedCards={setSelectedCards}
        selectedCards={selectedCards}
        isRevealed={isRevealed}
        cardId={cardId}
        cardVal={cardSnap.val()}
        cardRef={centerCardRef}
      />
    );
  }

  function SelectableCard({
    gameRef, 
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
    const werewolfSuspect = useObjectVal(gameRef.child("suspects").child("suspected werewolf"))

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
          werewolfSuspect[0] === cardId ? (
            <CardActive>
              <Card.Title>suspected werewolf</Card.Title>
            </CardActive>
          ) : (
            <CardActive>
              <Card.Title>?</Card.Title>
            </CardActive>
          )
        ) : werewolfSuspect[0] === cardId ? (
          <CardInactive>
            <Card.Title>suspected werewolf</Card.Title>
          </CardInactive>
        ) : (
          <CardInactive>
            <Card.Title>?</Card.Title>
          </CardInactive>
        )}
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
  
    function endNight(){
      gameRef.update({"isNight": false})
      gameRef.update({"status":"voting"})
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
          <Button type="button" variant="outline-danger" onClick={endNight}>
            End Night
          </Button>
        </Col>
      </Row>
    );
  }

function applyMarker(selectedCards,role,gameRef){
    if(selectedCards.length ===1){
        const roleDef = role
        gameRef.child("suspects").update({[roleDef]: selectedCards[0].cardId})
    }
  }
export default DayTime