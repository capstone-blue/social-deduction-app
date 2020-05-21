export async function masonMessages(gameRef, userId) {
  const masonList = [];
  await gameRef
    .child('players')
    .orderByChild('startingRole/name')
    .equalTo('Mason')
    .once('value', function (masonSnaps) {
      masonSnaps.forEach((w) => {
        masonList.push(w);
      });
    });

  // create a message with different contents depending on # of masons
  const messageContent =
    masonList.length > 1
      ? `
    ~Secret Message~
    There are two of you...
    ${masonList[0].val().alias} and ${masonList[1].val().alias}
    `
      : 'The other mason card is in the center';

  gameRef
    .child(`players/${userId}`)
    .child('messages')
    .update({ identity: messageContent });

  return masonList;
}
