import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { useList, useObjectVal } from 'react-firebase-hooks/database';
import { useUserId } from '../context/userContext';

function WerewolfGamePage({ match }) {
  const [gameSessionRef] = useState(
    db.ref('/gameSessions').child(match.params.id)
  );
  const [gameState, setGameState] = useState(null);
  const [count] = useState(15);

  // const decrement = () => setCount((c) => c - 1);

  // use 'once' to grab the initial state on load
  // firebase-hooks uses 'on', which we don't want in this case
  useEffect(() => {
    gameSessionRef.once('value', (gameSessionSnap) => {
      try {
        if (!gameSessionSnap.val())
          throw new Error('no value found in game snapshot');
        setGameState(gameSessionSnap.val());
      } catch (e) {
        console.error('Error loading intitial game state, ', e.message);
      }
    });
  }, [gameSessionRef, setGameState]);

  // count down timer
  // useEffect(() => {
  //   const interval = setInterval(() => {
  //     if (count > 0) {
  //       decrement();
  //     } else {
  //       setCount(15);
  //     }
  //   }, 1000);
  //   return () => clearInterval(interval);
  // }, [count]);

  return !gameState ? (
    <div>...Loading</div>
  ) : (
    <div>
      <h1>{gameState.name}</h1>
      <div>{gameState.isNight ? 'Night Phase' : 'Day Phase'}</div>
      <div>{gameState.availableRoles[0]}</div>
      <div>{`:${count}`}</div>
      <OpponentList gameRef={gameSessionRef} opponents={gameState.players} />
      <CenterCardList gameRef={gameSessionRef} />
      <Messages gameRef={gameSessionRef} />
      <PlayerCard gameRef={gameSessionRef} />
    </div>
  );
}

export default WerewolfGamePage;

function OpponentList({ gameRef }) {
  const [userId] = useUserId();
  const [playerSnaps, playerSnapsLoading] = useList(gameRef.child('players'));
  const [opponents, setOpponents] = useState(null);

  // filter current user out of list
  useEffect(() => {
    setOpponents(playerSnaps.filter((p) => p.key !== userId));
  }, [playerSnaps, userId]);

  return !opponents || playerSnapsLoading ? (
    ''
  ) : (
    <div>
      {opponents.map((o) => (
        <div key={o.key}>
          <div>{o.val().alias}</div>
          <div>?</div>
        </div>
      ))}
    </div>
  );
}

function CenterCardList({ gameRef }) {
  const [cardSnaps, cardSnapsLoading] = useList(gameRef.child('centerCards'));

  return cardSnapsLoading ? (
    ''
  ) : (
    <div>
      {cardSnaps.map((c) => (
        <div key={c.key}>?</div>
      ))}
    </div>
  );
}

function Messages({ gameRef }) {
  const [userId] = useUserId();
  const [messageSnaps, setMessageSnaps] = useState([]);

  // two tables involved, userMessages for indexes and messages with metadata
  // if a new index appears for user, look up message set it in state
  useEffect(() => {
    gameRef
      .child(`userMessages/${userId}`)
      .on('value', function (messageIdSnaps) {
        messageIdSnaps.forEach((messageIdSnap) => {
          const messageId = messageIdSnap.key;
          gameRef
            .child(`messages/${messageId}`)
            .once('value', function (messageSnap) {
              // the setState must take in the prev state or else it won't update properly
              setMessageSnaps((prevMessages) => [...prevMessages, messageSnap]);
            });
        });
      });
    return () => gameRef.child(`userMessages/${userId}`).off();
  }, [gameRef, setMessageSnaps, userId]);

  return (
    <div>
      <div>
        {messageSnaps.map((m) => {
          return (
            <div key={m.key}>
              <div>{m.val().contents}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function PlayerCard({ gameRef }) {
  const [userId] = useUserId();
  const [player, loadPlayer] = useObjectVal(gameRef.child(`players/${userId}`));
  console.log(player);

  return loadPlayer ? (
    ''
  ) : (
    <div>
      <div>{player.alias}</div>
      <div>{player.startingRole.name}</div>
      <ul>
        {player.startingRole.options.map((o, i) => (
          <li key={`card-${userId}-${i}`}>{o}</li>
        ))}
      </ul>
    </div>
  );
}
