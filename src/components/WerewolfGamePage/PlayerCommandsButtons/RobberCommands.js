import React from 'react';
import Button from 'react-bootstrap/Button';
// robber selection bug fix
function RobberCommands({
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
      console.log(currPlayer.startingRole.name, currentTurn);
      const [firstCard] = selectedCards;
      console.log(firstCard);
      const { cardRef: firstRef, cardVal: firstVal } = firstCard;
      console.log(currPlayer);
      const secondRef = gameRef.child(`players/${userId}/actualRole`);
      const secondVal = currPlayer.actualRole;
      console.log(firstRef, firstVal, secondRef, secondVal);

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
    selectedCards && selectedCards.length === 1 ? (
      selectedCards[0].cardId !== userId &&
      selectedCards[0].cardId !== 'card 1' &&
      selectedCards[0].cardId !== 'card 2' &&
      selectedCards[0].cardId !== 'card 3' ? (
        <Button variant="warning" onClick={swapCards}>
          swap cards
        </Button>
      ) : (
        <Button variant="warning" onClick={swapCards} disabled>
          select one other player's card to swap with
        </Button>
      )
    ) : (
      <Button variant="warning" onClick={swapCards} disabled>
        select one other player's card to swap with
      </Button>
    )
  ) : (
    <Button variant="warning" onClick={swapCards} disabled>
      you swapped roles with {currPlayer.actualRole.name}
    </Button>
  );
}

export default RobberCommands;
