import React from 'react';
import styled from 'styled-components';

const MessageContainer = styled.div`
  margin: 1rem 0;
  text-align: center;
  color: white;
`;

const MessageText = styled.div`
  font-size: 1.5rem;
`;

function Messages({ messages }) {
  let messageVals = undefined;
  if (messages) {
    messageVals = Object.values(messages);
  }

  return (
    <MessageContainer>
      {messages ? (
        <React.Fragment>
          <MessageText>Messages</MessageText>
          {messageVals.map((message) => (
            <div key={messageVals.indexOf(message)}>
              <div>{message}</div>
            </div>
          ))}
        </React.Fragment>
      ) : (
        <MessageText>No Messages</MessageText>
      )}
    </MessageContainer>
  );
}

export default Messages;
