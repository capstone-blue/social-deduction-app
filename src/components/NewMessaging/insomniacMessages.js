export function insomniacMessages(gameRef, currPlayer, userId) {
  // create a message with different contents depending on # of werewolves
  const messageContent =
    currPlayer.startingRole.name === currPlayer.actualRole.name
      ? `
        your card was not swapped
        `
      : `
        Your card was swapped with a ${currPlayer.actualRole.name}
        `;

  gameRef
    .child(`players/${userId}`)
    .child('messages')
    .update({ identity: messageContent });
}
