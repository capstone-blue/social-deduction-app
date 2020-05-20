import React from 'react';
import { useObject } from 'react-firebase-hooks/database';
import Row from 'react-bootstrap/Row';
import SelectableBoardCard from './SelectableBoardCard';

function MiddleCardList({
  gameRef,
  selectedCards,
  setSelectedCards,
  centerCards,
  currPlayer,
  currentTurn,
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
            currPlayer={currPlayer}
            currentTurn={currentTurn}
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
  currPlayer,
  currentTurn,
}) {
  console.log(currPlayer);
  const centerCardRef = gameRef.child(`centerCards/${cardId}`);
  const [cardSnap, loadingcardSnap] = useObject(centerCardRef);
  return loadingcardSnap ? (
    ''
  ) : (
    <SelectableBoardCard
      setSelectedCards={setSelectedCards}
      selectedCards={selectedCards}
      cardId={cardId}
      cardVal={cardSnap.val()}
      cardRef={centerCardRef}
      currPlayer={currPlayer}
      currentTurn={currentTurn}
    />
  );
}

export default MiddleCardList;
