import React, { useEffect } from 'react';
import SelectablePlayerCard from './SelectablePlayerCard';

function PlayerCard({
  userId,
  currPlayer,
  setCurrPlayerRole,
  gameRef,
  setSelectedCards,
  selectedCards,
}) {
  const playerRef = gameRef.child(`players/${userId}/actualRole`);

  useEffect(() => {
    setCurrPlayerRole(currPlayer.startingRole.name);
  }, [setCurrPlayerRole, currPlayer.startingRole.name]);

  return (
    <SelectablePlayerCard
      gameRef = {gameRef}
      setSelectedCards={setSelectedCards}
      selectedCards={selectedCards}
      cardId={userId}
      cardVal={currPlayer}
      cardRef={playerRef}
    />
  );
}

export default PlayerCard;
