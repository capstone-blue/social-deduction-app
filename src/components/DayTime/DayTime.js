import React, { useEffect, useState } from 'react';
import { db } from '../../firebase';
import { useObjectVal, useObject } from 'react-firebase-hooks/database';
import OpponentList from './OpponentList'
import MiddleCardList from './MiddleCardList'
import PlayerCard from './PlayerCard'
import DayCountDown from './DayCountDown'
import { useUserId } from '../../context/userContext';
import styled from 'styled-components';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Badge from 'react-bootstrap/Badge';
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

  const [allRoles, loadingAllRoles] = useObjectVal(
    gameRef.child('currentRoles')
  );
  const [markers, loadingMarker] = useObject(gameRef.child("markers"))

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
              suspects = {suspects.val()}
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
                   
              

          {
            allRoles.map(el=> <RoleMarkerButton key ={el} selectedCards = {selectedCards} role = {el} gameRef = {gameRef} applyMarker = {applyMarker} suspects = {suspects} markers = {markers} /> )
          }
            
          </aside>
        </Col>
      </Row>
    </Container>
  );
}




function applyMarker(selectedCards,role,gameRef, suspects, markers){
    if(selectedCards.length ===1){
        const roleDef = role
        console.log(suspects.val(), markers.val())
        if(suspects.val()&& markers.val()){
          if(suspects.val()[selectedCards[0].cardId] !== roleDef && markers.val()[roleDef] !== selectedCards[0].cardId){
            // gameRef.child("suspects").update({[roleDef]: null})
            gameRef.child("markers").update({[roleDef]:null})
            if(markers.val()[roleDef]){
              const resetValSus = markers.val()[roleDef]
              gameRef.child("suspects").update({[resetValSus]:null})
              gameRef.child("suspects").update({[selectedCards[0].cardId]:roleDef})
              gameRef.child("markers").update({[roleDef]:selectedCards[0].cardId})
            }
            else if(suspects.val()[selectedCards[0].cardId]){
              const resetValMark = suspects.val()[selectedCards[0].cardId]
              gameRef.child("markers").update({[resetValMark]:null})
              gameRef.child("suspects").update({[selectedCards[0].cardId]:roleDef})
              gameRef.child("markers").update({[roleDef]:selectedCards[0].cardId})

            }
            else{
              console.log('got here')
              gameRef.child("suspects").update({[selectedCards[0].cardId]:roleDef})
              gameRef.child("markers").update({[roleDef]:selectedCards[0].cardId})
            }
          }
          else{
            gameRef.child("suspects").update({[selectedCards[0].cardId]: null})
            gameRef.child("markers").update({[roleDef]:null})
          }
        }
        // else{
        //   if(suspects.val()[roleDef] && markers.val()[selectedCards[0].cardId] ){
        //     gameRef.child("suspects").update({[roleDef]: null})
        //     gameRef.child("markers").update({[selectedCards[0].cardId]:null})
        //     gameRef.child("suspects").update({[selectedCards[0].cardId]:roleDef})
        //     gameRef.child("markers").update({[roleDef]:selectedCards[0].cardId})
        //   }
          else{
            gameRef.child("suspects").update({[selectedCards[0].cardId]:roleDef})
            gameRef.child("markers").update({[roleDef]:selectedCards[0].cardId})
          }
        // }
    }
  }
export default DayTime