import React from 'react';
import Button from 'react-bootstrap/Button';

function SeerCommands({
  currPlayer,
  setSelectedCards,
  selectedCards,
  currentTurn,
}) {
  function revealCard() {
    if (currPlayer.startingRole.name === currentTurn) {
      console.log(console.log(selectedCards[0].isRevealed), currentTurn);
      if (selectedCards[0].isRevealed && selectedCards[0].isRevealed) {
        selectedCards[0].isRevealed = false;
        selectedCards[1].isRevealed = false;
      } else {
        selectedCards[0].isRevealed = true;
        selectedCards[1].isRevealed = true;
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

export default SeerCommands;
