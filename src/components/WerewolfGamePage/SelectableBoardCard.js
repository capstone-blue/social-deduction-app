import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

const BoardCard = styled.div`
  margin: 0 0.5rem;
  color: ${(props) => (props.theme.color ? props.theme.color : '#23272B')};
  width: 6rem;
  min-height: 8rem;
  padding: 1rem;
  font-size: 1.5rem;
  border: 1px solid gray;
  border-top-width: 0.5rem;
  border-style: solid;
  border-top-color: ${(props) => props.border || 'transparent'};
  border-radius: 0.25rem;
  background-color: #eaeaea;
  &:hover {
    background-color: ${(props) =>
      props.theme.hover ? props.theme.hover : '#B9BABB'};
  }
`;

function SelectableBoardCard({
  setSelectedCards,
  selectedCards,
  cardId,
  cardVal,
  cardRef,
  theme,
}) {
  const [card, setCard] = useState({});
  useEffect(() => {
    const thisCard = selectedCards.find((c) => c.cardId === cardId);
    if (thisCard) setCard(thisCard);
    else setCard({});
  }, [selectedCards, cardId]);

  function handleClick() {
    const thisCard = selectedCards.find((c) => c.cardId === cardId);
    // if this card is in the list, remove it
    if (thisCard) {
      setSelectedCards(selectedCards.filter((c) => c.cardId !== cardId));
      // otherwise, add it to the list
    } else {
      if (selectedCards.length === 2)
        return alert('You may only select 2 cards at a time');
      const newCard = {
        cardId,
        cardVal,
        cardRef,
        isRevealed: false,
        isSelected: true,
      };
      // if there is a card in the list already, give the new card a different border
      const firstCard = selectedCards[0];
      newCard.border =
        firstCard && firstCard.border === 'green' ? 'red' : 'green';
      setSelectedCards([...selectedCards, newCard]);
    }
  }
  return (
    <div className="text-center" onClick={handleClick}>
      <BoardCard border={card.border} theme={theme}>
        <div>{card.isRevealed ? cardVal.name : '?'}</div>
      </BoardCard>
    </div>
  );
}

export default SelectableBoardCard;
