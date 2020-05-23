import React, { useState, useEffect } from 'react';
import { db } from '../../firebase';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import UIfx from 'uifx';
import beepSound from '../../assets/sounds/beep.wav';
import selectSound from '../../assets/sounds/select.wav';

const beep = new UIfx(beepSound, {
  volume: 0.5,
  throttleMs: 50,
});

const select = new UIfx(selectSound, {
  volume: 0.5,
  throttleMs: 50,
});

function AliasModal({ match, currPlayer }) {
  const userId = currPlayer[0];
  const [show, setShow] = useState(false);
  const [alias, setAlias] = useState('');
  const [aliasError, setAliasError] = useState('');
  const [isValidated, setIsValidated] = useState(false);

  useEffect(() => {
    if (!currPlayer[1].alias) {
      setShow(true);
    }
  }, []);

  function handleSubmit(e) {
    beep.play();
    e.preventDefault();
    setIsValidated(true);
    // if the name is blank, don't set it in the database
    if (e.currentTarget.checkValidity() === false) {
      return e.stopPropagation();
    }

    const lobbyId = match.params.id;
    const updates = {
      [`users/${userId}/alias`]: alias,
      [`lobbies/${lobbyId}/players/${userId}/alias`]: alias,
    };
    db.ref().update(updates);
  }

  const handleClose = () => {
    try {
      setIsValidated(true);
      if (!alias && !currPlayer[1].alias) {
        throw new Error('you must provide an alias before continuing');
      }
      setAliasError('');
      setShow(false);
    } catch (e) {
      setAliasError(e.message);
    }
  };
  const handleShow = () => {
    select.play();
    setShow(true);
  };
  return (
    <>
      <Button size="sm" variant="outline-light" onClick={handleShow}>
        Rename
      </Button>

      <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>
            What would you like to set your{' '}
            <span style={{ color: '#c22c31' }}>alias</span> to?
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form noValidate validated={isValidated} onSubmit={handleSubmit}>
            <Form.Group>
              <Form.Control
                required
                type="text"
                placeholder="enter an alias"
                value={alias}
                onChange={(e) => setAlias(e.target.value)}
              />
              <Form.Control.Feedback type="invalid">
                {aliasError}
              </Form.Control.Feedback>
            </Form.Group>
            <Button type="submit" variant="dark" onClick={handleClose}>
              Save Changes
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
    </>
  );
}

export default AliasModal;
