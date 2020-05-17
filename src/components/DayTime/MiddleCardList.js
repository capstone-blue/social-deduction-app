import React from 'react';
import { useObject } from 'react-firebase-hooks/database';
import Row from 'react-bootstrap/Row';
import SelectableBoardCard from './SelectableBoardCard';

function MiddleCardList({
  gameRef,
  selectedCards,
  setSelectedCards,
  centerCards,
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
          />
        );
      })}
    </Row>
  );
}

function MiddleCard({ gameRef, cardId, setSelectedCards, selectedCards }) {
  const centerCardRef = gameRef.child(`centerCards/${cardId}`);
  const [cardSnap, loadingcardSnap] = useObject(centerCardRef);
  return loadingcardSnap ? (
    ''
  ) : (
    <SelectableBoardCard
      gameRef = {gameRef}
      setSelectedCards={setSelectedCards}
      selectedCards={selectedCards}
      cardId={cardId}
      cardVal={cardSnap.val()}
      cardRef={centerCardRef}
    />
  );
}

export default MiddleCardList;
