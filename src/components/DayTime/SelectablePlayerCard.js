import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import Badge from 'react-bootstrap/Badge';
import Card from 'react-bootstrap/Card';
import {useObjectVal} from 'react-firebase-hooks/database'

const PlayerCardStyle = styled(Card)`
  border-width: ${(props) => (props.border ? '3px' : '1px')};
  border-color: ${(props) => props.border || 'gray'};
`;

function SelectablePlayerCard({
  gameRef,
  setSelectedCards,
  selectedCards,
  cardId,
  cardVal,
  cardRef,
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
        cardVal: cardVal.actualRole,
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
      <div className="text-center">
        <Badge pill variant="success" className="text-center">
          {cardVal.alias}
        </Badge>
        <PlayerCardStyle border={card.border}>
          <Card.Title className="text-center">
            <div>{cardVal.startingRole.name}</div>
          </Card.Title>
          <Card.Body>
            <div>
              {cardVal.startingRole.options.map((o, i) => (
                <div key={`card-${cardId}-${i}`}>{o}</div>
              ))}
            </div>
          </Card.Body>
        </PlayerCardStyle>
      </div>
    </div>
  );
}

export default SelectablePlayerCard;
