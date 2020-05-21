import React, { useState } from 'react';
import Button from 'react-bootstrap/Button';
function VillageButton(props) {
  const [active, setActive] = useState(false);
  function clickActivate() {
    setActive(!active);
    props.buttonClicked(props.role);
  }
  return props.currentRolesList ? (
    props.currentRolesList.includes(props.role) ? (
      <Button variant="primary" onClick={() => clickActivate()} size="lg" block>
        {props.role}
      </Button>
    ) : (
      <Button
        variant="outline-primary"
        onClick={() => clickActivate()}
        size="lg"
        block
      >
        {props.role}
      </Button>
    )
  ) : (
    <Button
      variant="outline-primary"
      onClick={() => clickActivate()}
      size="lg"
      block
    >
      {props.role}
    </Button>
  );
}

export default VillageButton;
