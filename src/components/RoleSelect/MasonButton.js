import React, { useState } from 'react';
import Button from 'react-bootstrap/Button';
function MasonButton(props) {
  const [active, setActive] = useState(false);
  function clickActivate() {
    setActive(!active);
    props.masonButtonClicked();
  }
  return active ? (
    <div>
      <Button variant="primary" onClick={() => clickActivate()}>
        Mason 1
      </Button>
      {` `}
      <Button variant="primary" onClick={() => clickActivate()}>
        Mason 2
      </Button>
      {` `}
    </div>
  ) : (
    <div>
      <Button variant="outline-primary" onClick={() => clickActivate()}>
        Mason 1
      </Button>
      {` `}
      <Button variant="outline-primary" onClick={() => clickActivate()}>
        Mason 2
      </Button>
      {` `}
    </div>
  );
}

export default MasonButton;
