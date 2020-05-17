import React, { useEffect, useState } from 'react';
import { db } from '../../firebase';
import { useObjectVal, useList, useListKeys, useObject } from 'react-firebase-hooks/database';
import OpponentList from './OpponentList'
import MiddleCardList from './MiddleCardList'
import PlayerCard from './PlayerCard'
import DayCountDown from './DayCountDown'
// import OpponentCard from '../WerewolfGamePage'
import { useUserId } from '../../context/userContext';
import styled from 'styled-components';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Badge from 'react-bootstrap/Badge';
import Button from 'react-bootstrap/Button';
import Spinner from 'react-bootstrap/Spinner';
import RoleMarkerButton from './RoleMarkerButton'



const Board = styled(Container)`
  width: 80%;
  padding: 1rem;
  margin-bottom: 1rem;
  border-radius: 0.25rem;
  background-color: gray;
`;




function DayTime({match}){
    const [gameRef] = useState(db.ref().child('gameSessions').child(match.params.id))
    const [userId] = useUserId();

  // Listeners
  const [currPlayer, loadingCurrPlayer] = useObjectVal(
    gameRef.child(`players/${userId}`)
  );
  const [host, loadingHost] = useObjectVal(
    gameRef.child('players').orderByChild('host').equalTo(true)
  );

  const [suspects, loadingSuspect] = useObject(
    gameRef.child('suspects')
  )

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
          <DayCountDown gameRef ={gameRef} host = {host}/>
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
            </Col>
            <Col md = {6}>
              <PlayerCard
                gameRef = {gameRef}
                currPlayer={currPlayer}
                userId={userId}
                setCurrPlayerRole={setCurrPlayerRole}
                setSelectedCards={setSelectedCards}
                selectedCards={selectedCards}
              />
            </Col>
            <Col>
              {/* <ResetForm gameRef={gameRef} /> */}
            </Col>
          </Row>
        </Col>
        <Col md={2}>
          <aside className="text-center">
            <h2>Commands</h2>
            <Button variant="warning" onClick={revealCard}>
              Reveal Card
            </Button>
            <RoleMarkerButton selectedCards = {selectedCards} role = "werewolf" gameRef = {gameRef} applyMarker = {applyMarker} suspects = {suspects} />
          </aside>
        </Col>
      </Row>
    </Container>
  );
}



function DayCountdown({gameRef, host}) {
    const [userId] = useUserId();
    const [count, setCount] = useState('');
    const [endDayTime, loadingDayEndTime] = useObjectVal(gameRef.child('endDayTime'));
    const gameHasntStarted = !loadingDayEndTime && !endDayTime;
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
      if(host[userId]){
          if (gameHasntStarted) {
            // set an expiration time for 15 seconds into the future
            setEndTimeInDB();
          }else if (countDownReached) {
            gameRef.child('status').set('voting');
          }
      } 
    }, [
      gameRef,
      host,
      userId,
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
  
    return(
        seconds > 9
        ?<h2>Time Left: {minutes}:{seconds}</h2>
        :<h2>Time Left: {minutes}:0{seconds}</h2>
        )
}


function applyMarker(selectedCards,role,gameRef, suspects){
    if(selectedCards.length ===1){
        const roleDef = role
        if(suspects.val()){
          if(selectedCards[0].cardId !== suspects.val()[roleDef]){
            gameRef.child("suspects").update({[roleDef]: selectedCards[0].cardId})
          }
          else{
            gameRef.child("suspects").update({[roleDef]: null})
          }
        }
        else{
          gameRef.child("suspects").update({[roleDef]: selectedCards[0].cardId})
        }
    }
  }
export default DayTime