import React from 'react';
import styled from 'styled-components';
import Button from 'react-bootstrap/Button';

const MarkerButton = styled(Button)`
  margin: 0.25rem;
`;

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
    <MarkerButton
      variant="warning"
      name={props.role}
      onClick={clickActivate}
      size="sm"
    >
      {props.role.toLowerCase()}
    </MarkerButton>
  );
}

export default RoleMarkerButton;
