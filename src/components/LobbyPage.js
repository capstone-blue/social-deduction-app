import React, { useEffect, useState } from 'react';
import { db } from '../firebase';
import { useObjectVal } from 'react-firebase-hooks/database';
import { useUserId } from '../context/userContext';
import { GameStart } from './index'
import Modal from 'react-bootstrap/Modal'
import Button from 'react-bootstrap/Button'

// Main logic should be handled in this component
function LobbyPage({ match, history }) {
  const [lobbiesRef] = useState(db.ref().child('lobbies'));
  const [lobby, lobbyLoading] = useObjectVal(lobbiesRef.child(match.params.id));
  const [gameStarted, setGameStarted] = useState(false)


  return lobbyLoading ? (
    <div>...Loading</div>
  ) : (
      <div>
        <AliasModal match={match} />
        <LobbyView players={Object.entries(lobby.players)} name={lobby.name} />
        <GameStart players={Object.entries(lobby.players)} match={match} history={history} setGameStarted={setGameStarted} gameStarted={gameStarted} />
      </div>
    );
}

function LobbyView({ name, players }) {
  const [host, setHost] = useState({});
  const [members, setMembers] = useState([]);
  useEffect(() => {
    const m = [];
    let h = {};

    players.forEach((playerEntry) => {
      const [, player] = playerEntry;
      if (player.host) h = player;
      else m.push(playerEntry);
    });

    setHost(h);
    setMembers(m);
  }, [players]);

  return (
    <div>
      <h1>Lobby</h1>
      <h2>{name}</h2>
      <div>
        <h3>host</h3>
        <div>{host.alias ? host.alias : '(...)'}</div>
      </div>
      <div>
        <h3>members</h3>
        <div>
          {members.map((m) => {
            const [id, player] = m;
            return <div key={id}>{player.alias ? player.alias : '(...)'}</div>;
          })}
        </div>
      </div>
    </div>
  );
}


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
      <Button variant="primary" onClick={handleShow}>
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
            <Button type="submit" variant="primary" onClick={handleClose}>
              Save Changes
          </Button>
          </form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default LobbyPage;
