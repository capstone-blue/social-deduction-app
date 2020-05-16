import React, { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { werewolfTurn } from '../../utils/turns';
import { useObjectVal } from 'react-firebase-hooks/database';
import { useUserId } from '../../context/userContext';
import styled from 'styled-components';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Badge from 'react-bootstrap/Badge';
import Button from 'react-bootstrap/Button';
import Spinner from 'react-bootstrap/Spinner';
import TurnCountdown from './TurnCountdown';
import OpponentList from './OpponentList';
import MiddleCardList from './MiddleCardList';
import PlayerCard from './PlayerCard';
import Messages from './Messages';
import ResetForm from './ResetForm';

const Board = styled(Container)`
  width: 80%;
  padding: 1rem;
  margin-bottom: 1rem;
  border-radius: 0.25rem;
  background-color: gray;
`;

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

  function revealCard() {
    if (selectedCards.length > 1)
      return alert('You may only reveal one card at a time!');
    selectedCards[0].isRevealed
      ? setSelectedCards([{ ...selectedCards[0], isRevealed: false }])
      : setSelectedCards([{ ...selectedCards[0], isRevealed: true }]);
  }

  async function swapCards() {
    if (selectedCards.length < 2)
      return alert('You must have two cards selected to swap');
    const [firstCard, secondCard] = selectedCards;
    const { cardRef: firstRef, cardVal: firstVal } = firstCard;
    const { cardRef: secondRef, cardVal: secondVal } = secondCard;

    firstRef.set(secondVal);
    secondRef.set(firstVal);

    const firstNewBorder = firstCard.border === 'green' ? 'red' : 'green';
    const secondNewBorder = secondCard.border === 'green' ? 'red' : 'green';

    setSelectedCards([
      {
        ...firstCard,
        cardVal: secondVal,
        isRevealed: false,
        border: firstNewBorder,
      },
      {
        ...secondCard,
        cardVal: firstVal,
        isRevealed: false,
        border: secondNewBorder,
      },
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
      await werewolfTurn(gameSessionRef);
    }
    if (currentTurn === 'Werewolf' && currPlayerRole === 'Werewolf') {
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
            />
            <MiddleCardList
              gameRef={gameSessionRef}
              setSelectedCards={setSelectedCards}
              selectedCards={selectedCards}
              centerCards={initialGameState.centerCards}
            />
          </Board>
          <Row>
            <Col>
              <Messages gameRef={gameSessionRef} />
            </Col>
            <Col>
              <PlayerCard
                gameRef={gameSessionRef}
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
