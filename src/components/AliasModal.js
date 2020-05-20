import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { useUserId } from '../context/userContext';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';

function AliasModal({ match, players }) {
  const [show, setShow] = useState(false);
  const [userId] = useUserId();
  const [alias, setAlias] = useState('');
  const [aliasError, setAliasError] = useState('');
  const [isValidated, setIsValidated] = useState(false);

  useEffect(() => {
    const currPlayer = players.find((p) => userId === p[0]);
    if (!currPlayer[1].alias) {
      setShow(true);
    }
  }, [players, userId]);

  function handleSubmit(e) {
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
    const currPlayer = players.find((p) => userId === p[0]);
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
  const handleShow = () => setShow(true);

  return (
    <>
      <Button variant="dark" onClick={handleShow}>
        Create Alias
      </Button>

      <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>What would you like to set your alias as?</Modal.Title>
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
        <Modal.Footer>
          <Button variant="dark" onClick={handleClose}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default AliasModal;
