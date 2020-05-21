import React from 'react';

function Messages({ messages }) {
  console.log(messages);
  let messageVals = undefined;
  if (messages) {
    messageVals = Object.values(messages);
  }

  return messages ? (
    <div>
      <h3>Messages</h3>
      <div>
        {messageVals.map((message) => (
          <div key={messageVals.indexOf(message)}>
            <div>{message}</div>
          </div>
        ))}
      </div>
    </div>
  ) : (
    <div>
      <h3>Messages</h3>
      <div />
    </div>
  );
}

export default Messages;
