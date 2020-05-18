import React, { useState } from 'react';
import { db } from '../firebase';
import { useUserId } from '../context/userContext';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';

function AliasModal({ match }) {
  const [show, setShow] = useState(false);
  const [userId] = useUserId();
  const [alias, setAlias] = useState('');

  function handleSubmit(e) {
    e.preventDefault();
    const lobbyId = match.params.id;
    const updates = {
      [`users/${userId}/alias`]: alias,
      [`lobbies/${lobbyId}/players/${userId}/alias`]: alias,
    };
    db.ref().update(updates);
  }

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  return (
    <>
      <Button variant="dark" onClick={handleShow}>
        Create Alias
      </Button>

      <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>What would you like to set your name as?</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form onSubmit={handleSubmit}>
            <input
              type="text"
              value={alias}
              onChange={(e) => setAlias(e.target.value)}
            />
            <Button type="submit" variant="dark" onClick={handleClose}>
              Save Changes
            </Button>
          </form>
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
