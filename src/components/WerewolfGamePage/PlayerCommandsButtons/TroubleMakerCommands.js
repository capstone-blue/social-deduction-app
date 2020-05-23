import React from 'react';
import Button from 'react-bootstrap/Button';

function TroubleMakerCommands({
  userId,
  gameRef,
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

      const firstNewBorder =
        firstCard.border === '#27CCE5' ? '#DC3545' : '#27CCE5';
      const secondNewBorder =
        secondCard.border === '#27CCE5' ? '#DC3545' : '#27CCE5';

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
      gameRef
        .child(`players/${userId}/startingRole`)
        .update({ actions: currPlayer.startingRole.actions - 1 });
    } else {
      return alert('It is not your turn');
    }
  }
  return currPlayer.startingRole.actions > 0 ? (
    selectedCards && selectedCards.length === 2 ? (
      selectedCards[0].cardId === 'card 1' ||
      selectedCards[0].cardId === 'card 2' ||
      selectedCards[0].cardId === 'card 3' ? (
        <Button variant="warning" onClick={swapCards} disabled>
          you must select two player cards to swap
        </Button>
      ) : selectedCards[1].cardId === 'card 1' ||
        selectedCards[1].cardId === 'card 2' ||
        selectedCards[1].cardId === 'card 3' ? (
        <Button variant="warning" onClick={swapCards} disabled>
          you must select two player cards to swap
        </Button>
      ) : selectedCards[0].cardId === userId ||
        selectedCards[1].cardId === userId ? (
        <Button variant="warning" onClick={swapCards} disabled>
          you may not swap your own card
        </Button>
      ) : (
        <Button variant="warning" onClick={swapCards}>
          swap cards
        </Button>
      )
    ) : (
      <Button variant="warning" onClick={swapCards} disabled>
        you must select two player cards to swap
      </Button>
    )
  ) : (
    <Button variant="warning" onClick={swapCards} disabled>
      you already swapped two cards
    </Button>
  );
}

export default TroubleMakerCommands;
