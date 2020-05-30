import React from 'react';
import Button from 'react-bootstrap/Button';
import { useObjectVal } from 'react-firebase-hooks/database';
function WerewolfCommands({
  userId,
  gameRef,
  currPlayer,
  setSelectedCards,
  selectedCards,
  currentTurn,
}) {
  const [wolves] = useObjectVal(gameRef.child('wolfCount'));
  function revealCard() {
    if (currPlayer.startingRole.name === currentTurn) {
      selectedCards[0].isRevealed
        ? setSelectedCards([{ ...selectedCards[0], isRevealed: false }])
        : setSelectedCards([{ ...selectedCards[0], isRevealed: true }]);
      gameRef
        .child(`players/${userId}/startingRole`)
        .update({ actions: currPlayer.startingRole.actions - 1 });
    } else {
      return null;
    }
  }
  return currPlayer.startingRole.actions > 0 ? (
    wolves < 2 ? (
      selectedCards[0] && selectedCards.length !== 2 ? (
        selectedCards[0].cardId === 'card 1' ||
        selectedCards[0].cardId === 'card 2' ||
        selectedCards[0].cardId === 'card 3' ? (
          <Button variant="warning" onClick={revealCard}>
            reveal card
          </Button>
        ) : (
          <Button variant="warning" onClick={revealCard} disabled>
            select one center card to reveal
          </Button>
        )
      ) : (
        <Button variant="warning" onClick={revealCard} disabled>
          select one center card to reveal
        </Button>
      )
    ) : (
      <Button variant="warning" onClick={revealCard} disabled>
        there are multiple werewolves in this game
      </Button>
    )
  ) : (
    <Button variant="warning" onClick={revealCard} disabled>
      you have already revealed a card
    </Button>
  );
}

export default WerewolfCommands;
