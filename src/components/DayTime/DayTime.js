import React, { useEffect, useState } from 'react';
import { db } from '../../firebase';
import { useObjectVal, useObject } from 'react-firebase-hooks/database';
import OpponentList from './OpponentList';
import MiddleCardList from './MiddleCardList';
import PlayerCard from './PlayerCard';
import DayCountDown from './DayCountDown';
import { useUserId } from '../../context/userContext';
import styled from 'styled-components';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Spinner from 'react-bootstrap/Spinner';
import RoleMarkerButton from './RoleMarkerButton';
import SuspectedPlayerRole from './SuspectedPlayerRole';

const PageContainer = styled(Container)`
  position: relative;
`;

const Board = styled(Container)`
  min-width: 90%;
  padding: 1rem;
  margin-bottom: 1rem;
  border-radius: 0.25rem;
  background-color: rgba(52, 58, 64, 0.65);
`;

const StickyUI = styled.div`
  position: fixed;
  bottom: 0;
  left: 0;
  height: 10rem;
  width: 100%;
  padding: 1rem;
  border-radius: 0.25rem;
  border-top: 1rem solid rgba(52, 58, 64, 1);
  background-color: #22262a;
`;

const CommandText = styled.div`
  color: white;
  font-size: 1.5rem;
`;

function DayTime({ match }) {
  const [gameRef] = useState(
    db.ref().child('gameSessions').child(match.params.id)
  );
  const [userId] = useUserId();

  // Listeners
  const [currPlayer, loadingCurrPlayer] = useObjectVal(
    gameRef.child(`players/${userId}`)
  );
  const [host, loadingHost] = useObjectVal(
    gameRef.child('players').orderByChild('host').equalTo(true)
  );

  const [suspects, loadingSuspects] = useObject(gameRef.child('suspects'));

  const [allRoles] = useObjectVal(gameRef.child('currentRoles'));
  const [markers] = useObject(gameRef.child('markers'));

  // State - should only influence current user's own screen
  const [initialGameState, setGameState] = useState(null);
  const [, setCurrPlayerRole] = useState('');
  const [selectedCards, setSelectedCards] = useState([]);
  const [isRevealed] = useState(false);
  // function revealCard() {
  //     isRevealed ? setIsRevealed(false) : setIsRevealed(true);
  //   }

  useEffect(() => {
    gameRef.once('value', (gameSessionSnap) => {
      try {
        if (!gameSessionSnap.val())
          throw new Error('no value found in game snapshot');
        const gameState = gameSessionSnap.val();
        setGameState(gameState);
      } catch (e) {
        // console.error('Error loading intitial game state, ', e.message);
      }
    });
  }, [gameRef, setGameState]);

  return !initialGameState ||
    loadingHost ||
    loadingCurrPlayer ||
    loadingSuspects ? (
    <Spinner animation="border" role="status" />
  ) : (
    <PageContainer>
      <Row>
        <Col>
          <Row className="text-center">
            <DayCountDown gameRef={gameRef} host={host} />
          </Row>
          <Board>
            <Row>
              <Col />
              <Col xs="auto">
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
                  suspects={suspects.val()}
                />
              </Col>
              <Col />
            </Row>
          </Board>
        </Col>
      </Row>
      <StickyUI>
        <Row>
          <SuspectedPlayerRole suspects={suspects} userId={userId} />
          <Col>
            <PlayerCard
              gameRef={gameRef}
              currPlayer={currPlayer}
              userId={userId}
              setCurrPlayerRole={setCurrPlayerRole}
              setSelectedCards={setSelectedCards}
              selectedCards={selectedCards}
            />
          </Col>
          <Col>
            <CommandText>Mark your suspects</CommandText>
            <Row>
              {allRoles.map((el) => (
                <RoleMarkerButton
                  key={el}
                  selectedCards={selectedCards}
                  role={el}
                  gameRef={gameRef}
                  applyMarker={applyMarker}
                  suspects={suspects}
                  markers={markers}
                />
              ))}
            </Row>
          </Col>
        </Row>
      </StickyUI>
    </PageContainer>
  );
}

function applyMarker(selectedCards, role, gameRef, suspects, markers) {
  if (selectedCards.length === 1) {
    const roleDef = role;
    if (suspects.val() && markers.val()) {
      if (
        suspects.val()[selectedCards[0].cardId] !== roleDef &&
        markers.val()[roleDef] !== selectedCards[0].cardId
      ) {
        // gameRef.child("suspects").update({[roleDef]: null})
        gameRef.child('markers').update({ [roleDef]: null });
        if (markers.val()[roleDef]) {
          const resetValSus = markers.val()[roleDef];
          gameRef.child('suspects').update({ [resetValSus]: null });
          gameRef
            .child('suspects')
            .update({ [selectedCards[0].cardId]: roleDef });
          gameRef
            .child('markers')
            .update({ [roleDef]: selectedCards[0].cardId });
        } else if (suspects.val()[selectedCards[0].cardId]) {
          const resetValMark = suspects.val()[selectedCards[0].cardId];
          gameRef.child('markers').update({ [resetValMark]: null });
          gameRef
            .child('suspects')
            .update({ [selectedCards[0].cardId]: roleDef });
          gameRef
            .child('markers')
            .update({ [roleDef]: selectedCards[0].cardId });
        } else {
          gameRef
            .child('suspects')
            .update({ [selectedCards[0].cardId]: roleDef });
          gameRef
            .child('markers')
            .update({ [roleDef]: selectedCards[0].cardId });
        }
      } else {
        gameRef.child('suspects').update({ [selectedCards[0].cardId]: null });
        gameRef.child('markers').update({ [roleDef]: null });
      }
    }
    // else{
    //   if(suspects.val()[roleDef] && markers.val()[selectedCards[0].cardId] ){
    //     gameRef.child("suspects").update({[roleDef]: null})
    //     gameRef.child("markers").update({[selectedCards[0].cardId]:null})
    //     gameRef.child("suspects").update({[selectedCards[0].cardId]:roleDef})
    //     gameRef.child("markers").update({[roleDef]:selectedCards[0].cardId})
    //   }
    else {
      gameRef.child('suspects').update({ [selectedCards[0].cardId]: roleDef });
      gameRef.child('markers').update({ [roleDef]: selectedCards[0].cardId });
    }
    // }
  }
}
export default DayTime;
