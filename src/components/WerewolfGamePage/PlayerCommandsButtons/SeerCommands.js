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
      console.log(selectedCards[0], selectedCards[1]);
      if (selectedCards.length === 2) {
        if (selectedCards[0].isRevealed && selectedCards[1].isRevealed) {
          selectedCards[0].isRevealed = false;
          selectedCards[1].isRevealed = false;
          setSelectedCards([...selectedCards]);
        } else {
          selectedCards[0].isRevealed = true;
          selectedCards[1].isRevealed = true;
          setSelectedCards([...selectedCards]);
        }
      } else if (selectedCards.length === 1) {
        if (selectedCards[0].isRevealed) {
          selectedCards[0].isRevealed = false;
          setSelectedCards([...selectedCards]);
        } else {
          selectedCards[0].isRevealed = true;
          setSelectedCards([...selectedCards]);
        }
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
