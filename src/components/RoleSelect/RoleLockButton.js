import React from 'react';
import Button from 'react-bootstrap/Button';
import UIfx from 'uifx';
import guillotineSound from '../../assets/sounds/guillotine.mp3';

const guillotine = new UIfx(guillotineSound, {
  volume: 0.4,
  throttleMs: 50,
});

function RoleLockButton(props) {
  function clickActivate() {
    guillotine.play();
    props.wolfy(
      props.roles,
      props.players,
      props.playersRef,
      props.roleList,
      props.gameRef
    );
    props.gameRef.update({
      rolesSet: true,
      status: 'nightPhase',
    });
  }
  return (
    <Button variant="success" onClick={() => clickActivate()} size="lg" block>
      Lock In Roles
    </Button>
  );
}

export default RoleLockButton;
