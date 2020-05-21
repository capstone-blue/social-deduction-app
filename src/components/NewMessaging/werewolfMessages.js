export async function werewolfMessages(gameRef, userId) {
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

  // create a message with different contents depending on # of werewolves
  const messageContent =
    werewolfList.length > 1
      ? `
  ~Secret Message~
  There are two of you...
  ${werewolfList[0].val().alias} and ${werewolfList[1].val().alias}
  `
      : 'You are the only werewolf...look at a card in the center';

  gameRef
    .child(`players/${userId}`)
    .child('messages')
    .update({ identity: messageContent });

  return werewolfList;
}
