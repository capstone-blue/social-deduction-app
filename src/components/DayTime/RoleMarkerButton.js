import React from 'react';
import Button from 'react-bootstrap/Button';
function RoleMarkerButton(props) {
  function clickActivate() {
    props.applyMarker(
      props.selectedCards,
      props.role,
      props.gameRef,
      props.suspects,
      props.markers
    );
  }
  return (
    <Button variant="warning" name={props.role} onClick={clickActivate}>
      Mark this player as {props.role}
    </Button>
  );
}

export default RoleMarkerButton;
