export async function werewolfTurn(gameRef) {
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
  const newMessageRef = await gameRef.child('messages').push();
  const messageContent =
    werewolfList.length > 1
      ? `
~Secret Message~
There are two of you...
${werewolfList[0].val().alias} and ${werewolfList[1].val().alias}
`
      : 'You are the only werewolf...look at a card in the center';

  newMessageRef.child('contents').set(messageContent);
  werewolfList.forEach((w) => {
    const updates = {};
    updates[`${w.key}/${newMessageRef.key}`] = true;
    gameRef.child('userMessages').update(updates);
  });
  return werewolfList;
}
