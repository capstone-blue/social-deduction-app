import React from 'react';
import { useObject } from 'react-firebase-hooks/database';
import styled from 'styled-components';
import Row from 'react-bootstrap/Row';
import Badge from 'react-bootstrap/Badge';
import SelectableBoardCard from './SelectableBoardCard';

const MiddleRow = styled(Row)`
  margin-bottom: 1rem;
`;

function MiddleCardList({
  gameRef,
  selectedCards,
  setSelectedCards,
  centerCards,
}) {
  return (
    <MiddleRow className="justify-content-center">
      {Object.entries(centerCards).map((c) => {
        const [cardId] = c;
        return (
          <div key={cardId} className="text-center">
            <Badge pill variant="dark">
              Center Card
            </Badge>
            <MiddleCard
              gameRef={gameRef}
              cardId={cardId}
              setSelectedCards={setSelectedCards}
              selectedCards={selectedCards}
            />
          </div>
        );
      })}
    </MiddleRow>
  );
}

function MiddleCard({ gameRef, cardId, setSelectedCards, selectedCards }) {
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
    />
  );
}

export default MiddleCardList;
