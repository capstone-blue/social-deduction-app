import React, { useState, useEffect } from 'react';
import { useUserId } from '../../context/userContext';

function Messages({ gameRef }) {
  const [userId] = useUserId();
  const [messageSnaps, setMessageSnaps] = useState([]);

  // two tables involved, userMessages for indexes and messages with metadata
  // if a new index appears for user, look up message set it in state
  useEffect(() => {
    gameRef
      .child(`userMessages/${userId}`)
      .on('value', function (messageIdSnaps) {
        setMessageSnaps([]);
        messageIdSnaps.forEach((messageIdSnap) => {
          const messageId = messageIdSnap.key;
          gameRef
            .child(`messages/${messageId}`)
            .once('value', function (messageSnap) {
              // the setState must take in the prev state or else it won't update properly
              setMessageSnaps((prevMessages) => {
                return [...prevMessages, messageSnap];
              });
            });
        });
      });
    return () => gameRef.child(`userMessages/${userId}`).off();
  }, [gameRef, setMessageSnaps, userId]);

  return (
    <div>
      <h3>Messages</h3>
      <div>
        {messageSnaps.map((m) =>
          m.val() ? (
            <div key={m.key}>
              <div>{m.val().contents}</div>
            </div>
          ) : (
            ''
          )
        )}
      </div>
    </div>
  );
}

export default Messages;
