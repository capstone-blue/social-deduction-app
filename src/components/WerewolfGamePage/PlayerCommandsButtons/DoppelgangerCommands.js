import React from 'react';
import Button from 'react-bootstrap/Button';

function DoppelgangerCommands({
  userId,
  gameRef,
  currPlayer,
  setSelectedCards,
  selectedCards,
  currentTurn,
}) {
  function revealCard() {
    if (currPlayer.startingRole.name === currentTurn) {
      console.log(currPlayer.startingRole.name, currentTurn);
      if (selectedCards[0].isRevealed) {
        setSelectedCards([{ ...selectedCards[0], isRevealed: false }]);
      } else {
        setSelectedCards([{ ...selectedCards[0], isRevealed: true }]);
        gameRef
          .child(`players/${userId}/startingRole`)
          .update({ actions: currPlayer.startingRole.actions - 1 });
      }
    } else {
      return null;
    }
  }
  return (
    <Button variant="warning" onClick={revealCard}>
      reveal card
    </Button>
  );
}

export default DoppelgangerCommands;
