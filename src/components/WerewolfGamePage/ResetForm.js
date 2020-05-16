import React, { useState } from 'react';
import { db } from '../../firebase';
import { useUserId } from '../../context/userContext';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';

function ResetForm({ gameRef }) {
  const [userId] = useUserId();
  const [fakeUserId, setFakeUserId] = useState('');
  const [host, setHost] = useState(true);
  const [role, setRole] = useState('werewolf');
  const toggleHost = () => {
    setHost(!host);
  };

  function handleRoleSwitch(e) {
    setRole(e.target.value);
  }

  function seedDatabase(e) {
    e.preventDefault();
    db.ref(`/games/werewolf/roles/${role}`).once('value', function (roleSnap) {
      const id = fakeUserId ? fakeUserId : userId;
      const newRole = roleSnap.val();
      const updates = {
        [`players/${id}/host`]: host,
        [`players/${id}/startingRole`]: newRole,
      };
      gameRef.update(updates);
    });
  }

  function restartGame(e) {
    e.preventDefault();
    const updates = {
      turnOrder: {
        '0': 'Werewolf',
        '1': 'Seer',
        '2': 'Robber',
        '3': 'Villager',
      },
      currentTurn: 'Werewolf',
      userMessages: null,
      messages: null,
      endTime: null,
    };
    gameRef.update(updates);
  }

  return (
    <Row>
      <Col>
        <Form onSubmit={seedDatabase}>
          <div key="host" className="mb-3">
            <Form.Switch
              id="custom-switch"
              label="Make Host"
              onChange={toggleHost}
              checked={host}
            />
          </div>
          <Form.Check
            name="role"
            type="radio"
            id="custom-radio"
            label="werewolf"
            value="werewolf"
            checked={role === 'werewolf'}
            onChange={handleRoleSwitch}
          />
          <Form.Check
            name="role"
            type="radio"
            id="custom-radio"
            label="seer"
            value="seer"
            onChange={handleRoleSwitch}
          />
          <Form.Check
            name="role"
            type="radio"
            id="custom-radio"
            label="robber"
            value="robber"
            onChange={handleRoleSwitch}
          />
          <Form.Check
            name="role"
            type="radio"
            id="custom-radio"
            label="villager"
            value="villager"
            onChange={handleRoleSwitch}
          />
          <Form.Control
            onChange={(e) => setFakeUserId(e.target.value)}
            value={fakeUserId}
          />
          <Button variant="outline-primary" type="submit">
            Change Player
          </Button>
        </Form>
      </Col>
      <Col>
        <Button type="button" variant="outline-danger" onClick={restartGame}>
          Restart Game
        </Button>
      </Col>
    </Row>
  );
}

export default ResetForm;
