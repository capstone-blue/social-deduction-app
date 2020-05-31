import React from 'react';
import Button from 'react-bootstrap/Button';

function SeerCommands({
  userId,
  gameRef,
  currPlayer,
  setSelectedCards,
  selectedCards,
  currentTurn,
}) {
  function revealCard() {
    if (currPlayer.startingRole.name === currentTurn) {
      if (selectedCards) {
        if (selectedCards.length === 2) {
          if (selectedCards[0].isRevealed && selectedCards[1].isRevealed) {
            selectedCards[0].isRevealed = false;
            selectedCards[1].isRevealed = false;
            setSelectedCards([...selectedCards]);
          } else {
            selectedCards[0].isRevealed = true;
            selectedCards[1].isRevealed = true;
            setSelectedCards([...selectedCards]);
            gameRef
              .child(`players/${userId}/startingRole`)
              .update({ actions: currPlayer.startingRole.actions - 1 });
          }
        } else if (selectedCards.length === 1) {
          if (selectedCards[0].isRevealed) {
            selectedCards[0].isRevealed = false;
            setSelectedCards([...selectedCards]);
          } else {
            selectedCards[0].isRevealed = true;
            setSelectedCards([...selectedCards]);
            gameRef
              .child(`players/${userId}/startingRole`)
              .update({ actions: currPlayer.startingRole.actions - 1 });
          }
        }
      }
    } else {
      return null;
    }
  }
  return currPlayer.startingRole.actions > 0 ? (
    selectedCards.length === 2 ? (
      selectedCards[1].cardId === 'card 1' ||
      selectedCards[1].cardId === 'card 2' ||
      selectedCards[1].cardId === 'card 3' ? (
        selectedCards[0].cardId === 'card 1' ||
        selectedCards[0].cardId === 'card 2' ||
        selectedCards[0].cardId === 'card 3' ? (
          <Button variant="warning" onClick={revealCard}>
            reveal cards
          </Button>
        ) : (
          <Button variant="warning" onClick={revealCard} disabled>
            select either one player card OR two center cards
          </Button>
        )
      ) : (
        <Button variant="warning" onClick={revealCard} disabled>
          select either one player card OR two center cards
        </Button>
      )
    ) : selectedCards.length === 1 ? (
      selectedCards[0].cardId === 'card 1' ||
      selectedCards[0].cardId === 'card 2' ||
      selectedCards[0].cardId === 'card 3' ? (
        <Button variant="warning" onClick={revealCard} disabled>
          select either one player card OR two center cards
        </Button>
      ) : (
        <Button variant="warning" onClick={revealCard}>
          reveal player card
        </Button>
      )
    ) : (
      <Button variant="warning" onClick={revealCard} disabled>
        zero cards selected
      </Button>
    )
  ) : (
    <Button variant="warning" onClick={revealCard} disabled>
      you have already revealed cards
    </Button>
  );
  // ? selectedCards !== []
  //   ? selectedCards.length === 1
  //     ? selectedCards[0].cardId === "card 1" || selectedCards[0].cardId === "card 2" || selectedCards[0].cardId === "card 3"
  //       ? (
  //         <Button variant="warning" onClick={revealCard} disabled>
  //           you may reveal one player card OR two center cards
  //         </Button>
  //         )
  //       : (
  //         <Button variant="warning" onClick={revealCard}>
  //           reveal card
  //         </Button>
  //         )
  //     : selectedCards[0].cardId !== "card 1" && selectedCards[0].cardId !== "card 2" && selectedCards[0].cardId !== "card 3"
  //       ? (
  //         <Button variant="warning" onClick={revealCard} disabled>
  //           you may reveal one player card OR two center cards
  //         </Button>
  //         )
  //       : (
  //         <Button variant="warning" onClick={revealCard}>
  //           reveal cards
  //         </Button>
  //         )
  //   : (
  //     <Button variant="warning" onClick={revealCard} disabled>
  //       select cards to reveal
  //     </Button>
  //     )
  // : (
  //   <Button variant="warning" onClick={revealCard} disabled>
  //     you have already revealed cards
  //   </Button>
  //   )
}

export default SeerCommands;
