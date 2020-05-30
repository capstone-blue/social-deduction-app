import React from 'react';
import Button from 'react-bootstrap/Button';

function DrunkCommands({
  userId,
  gameRef,
  currPlayer,
  setSelectedCards,
  selectedCards,
  currentTurn,
}) {
  function swapCards() {
    if (selectedCards.length !== 1) {
      return null;
    } else if (currPlayer.startingRole.name === currentTurn) {
      const [firstCard] = selectedCards;
      const { cardRef: firstRef, cardVal: firstVal } = firstCard;
      const secondRef = gameRef.child(`players/${userId}/actualRole`);
      const secondVal = currPlayer.actualRole;

      firstRef.set(secondVal);
      secondRef.set(firstVal);
      gameRef
        .child(`players/${userId}/startingRole`)
        .update({ actions: currPlayer.startingRole.actions - 1 });

      // const firstNewBorder = firstCard.border === 'green' ? 'red' : 'green';
      // const secondNewBorder = secondCard.border === 'green' ? 'red' : 'green';

      setSelectedCards([
        {
          ...firstCard,
          cardVal: secondVal,
          isRevealed: false,
          // border: firstNewBorder,
        },
        // ,
        // {
        //   ...secondCard,
        //   cardVal: firstVal,
        //   isRevealed: false,
        //   border: secondNewBorder,
        // },
      ]);
    } else {
      return alert('It is not your turn');
    }
  }
  return currPlayer.startingRole.actions > 0 ? (
    <Button variant="warning" onClick={swapCards}>
      swap cards
    </Button>
  ) : (
    <Button variant="warning" onClick={swapCards} disabled>
      you swapped roles
    </Button>
  );
}

export default DrunkCommands;
