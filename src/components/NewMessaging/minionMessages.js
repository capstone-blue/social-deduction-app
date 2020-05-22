export async function minionMessages(gameRef, userId) {
  const werewolfList = [];
  await gameRef
    .child('players')
    .orderByChild('startingRole/name')
    .equalTo('Werewolf')
    .once('value', function (werewolfSnaps) {
      werewolfSnaps.forEach((w) => {
        werewolfList.push(w);
      });
    });

  let messageContent = '';
  // create a message with different contents depending on # of werewolves
  if (werewolfList.length > 1) {
    messageContent = `
        ~Secret Message~
        There are two werewolves...
        ${werewolfList[0].val().alias} and ${werewolfList[1].val().alias}
        `;
  } else if (werewolfList.length === 1) {
    messageContent = `${werewolfList[0].val().alias} is the only werewolf`;
  } else {
    messageContent = 'none of the players are werewolves';
  }
  gameRef
    .child(`players/${userId}`)
    .child('messages')
    .update({ identity: messageContent });

  return werewolfList;
}
