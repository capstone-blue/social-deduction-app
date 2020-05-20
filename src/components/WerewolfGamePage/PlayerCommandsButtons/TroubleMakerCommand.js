import React from 'react';
import Button from 'react-bootstrap/Button';

function TroubleMakerCommands({
  currPlayer,
  setSelectedCards,
  selectedCards,
  currentTurn,
}) {
  function swapCards() {
    if (selectedCards.length < 2) {
      return null;
    } else if (currPlayer.startingRole.name === currentTurn) {
      console.log(currPlayer.startingRole.name, currentTurn);
      const [firstCard, secondCard] = selectedCards;
      const { cardRef: firstRef, cardVal: firstVal } = firstCard;
      const { cardRef: secondRef, cardVal: secondVal } = secondCard;

      firstRef.set(secondVal);
      secondRef.set(firstVal);

      const firstNewBorder = firstCard.border === 'green' ? 'red' : 'green';
      const secondNewBorder = secondCard.border === 'green' ? 'red' : 'green';

      setSelectedCards([
        {
          ...firstCard,
          cardVal: secondVal,
          isRevealed: false,
          border: firstNewBorder,
        },
        {
          ...secondCard,
          cardVal: firstVal,
          isRevealed: false,
          border: secondNewBorder,
        },
      ]);
    } else {
      return alert('It is not your turn');
    }
  }
  return (
    <Button variant="warning" onClick={swapCards}>
      swap cards
    </Button>
  );
}

export default TroubleMakerCommands;
