import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import {useObjectVal, useObject, useListKeys} from 'react-firebase-hooks/database'
import Card from 'react-bootstrap/Card';

const BoardCard = styled(Card)`
  width: 5rem;
  min-height: 7rem;
  padding: 1rem;
  font-size: 1.5rem;
  border-width: ${(props) => (props.border ? '2px' : '1px')};
  border-color: ${(props) => props.border || 'gray'};
`;

function SelectableBoardCard({
  gameRef,
  setSelectedCards,
  selectedCards,
  cardId,
  playerVal,
  cardVal,
  cardRef,
}) {
  const [card, setCard] = useState({});
  const [suspects, loadingSuspects] = useObject(gameRef.child('suspects'))
  const [markers, loadingmarkers] = useObject(gameRef.child('markers'))
//  console.log(markers)
  let suspectIdentity = undefined
  if(suspects){
    if(suspects.val()){
      // const suspectKeys = Object.keys(suspects.val())
      // if(suspectKeys){
      //   const valIndex = suspectKeys.indexOf(playerVal)
      //   console.log(valIndex)
      //   if(valIndex >= 0){
      //     console.log('got here')
      //     const susValues = Object.values(suspects.val())
      //     suspectIdentity = susValues[valIndex]
      //     console.log(suspectIdentity)
      //   }
    
    
    
      // }
      if(suspects.val()[playerVal]){
        suspectIdentity = suspects.val()[playerVal]
      }

    }

  }

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
      <BoardCard border={card.border}>
        {suspectIdentity
          ?<Card.Title> suspected {suspectIdentity} </Card.Title>
          : <Card.Title> ? </Card.Title>
        }
      </BoardCard>
    </div>
  );
}

export default SelectableBoardCard;
