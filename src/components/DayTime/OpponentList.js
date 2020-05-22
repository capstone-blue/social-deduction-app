import React, { useState, useEffect } from 'react';
import { useObject } from 'react-firebase-hooks/database';
import { useUserId } from '../../context/userContext';
import Row from 'react-bootstrap/Row';
import Badge from 'react-bootstrap/Badge';
import SelectableBoardCard from './SelectableBoardCard';

function OpponentList({
  gameRef,
  setSelectedCards,
  selectedCards,
  players,
  currPlayer,
  currentTurn,
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
            currPlayer={currPlayer}
            currentTurn={currentTurn}
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
  currPlayer,
  currentTurn,
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
      <SelectableBoardCard
        gameRef={gameRef}
        setSelectedCards={setSelectedCards}
        selectedCards={selectedCards}
        cardId={opponentId}
        playerVal={opponentId}
        cardVal={cardSnap.val()}
        cardRef={playerRef}
      />
    </div>
  );
}

export default OpponentList;
