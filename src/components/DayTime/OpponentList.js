import React, { useState, useEffect } from 'react';
import { useObject } from 'react-firebase-hooks/database';
import { useUserId } from '../../context/userContext';
import styled from 'styled-components';
import Row from 'react-bootstrap/Row';
import Badge from 'react-bootstrap/Badge';
import SelectableBoardCard from './SelectableBoardCard';

const OpponentRow = styled(Row)`
  margin-bottom: 1rem;
`;

const OpponentBadge = styled(Badge)`
  font-size: 1rem;
  font-weight: 100;
`;

function OpponentList({ gameRef, setSelectedCards, selectedCards, players }) {
  const [userId] = useUserId();
  const [opponents, setOpponents] = useState(null);
  // filter current user out of list
  useEffect(() => {
    setOpponents(Object.entries(players).filter((p) => p[0] !== userId));
  }, [players, userId]);

  return !opponents ? (
    ''
  ) : (
    <OpponentRow className="justify-content-center">
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
          />
        );
      })}
    </OpponentRow>
  );
}

function OpponentCard({
  gameRef,
  opponentId,
  alias,
  setSelectedCards,
  selectedCards,
}) {
  const playerRef = gameRef.child(`players/${opponentId}/actualRole`);
  const [cardSnap, loadingcardSnap] = useObject(playerRef);
  return loadingcardSnap ? (
    ''
  ) : (
    <div className="text-center">
      <OpponentBadge pill variant="info">
        {alias}
      </OpponentBadge>
      <SelectableBoardCard
        gameRef={gameRef}
        setSelectedCards={setSelectedCards}
        selectedCards={selectedCards}
        cardId={opponentId}
        cardVal={cardSnap.val()}
        cardRef={playerRef}
        theme={{ color: '#18A2B8', hover: '#bcced9' }}
      />
    </div>
  );
}

export default OpponentList;
