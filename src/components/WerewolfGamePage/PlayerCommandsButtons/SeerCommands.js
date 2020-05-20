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
      console.log(currPlayer.startingRole.name, currentTurn);
      selectedCards[0].isRevealed
        ? setSelectedCards([{ ...selectedCards[0], isRevealed: false }])
        : setSelectedCards([{ ...selectedCards[0], isRevealed: true }]);
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
