import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { matchPath, withRouter } from 'react-router';
import styled from 'styled-components';
import Navbar from 'react-bootstrap/Navbar';
import Nav from 'react-bootstrap/Nav';
import Button from 'react-bootstrap/Button';
import logo from '../assets/animals.svg';
import Sound from 'react-sound';
import sillyBackground from '../assets/sounds/sillyBackground.wav';
import howl from '../assets/sounds/howl.wav';
import rooster from '../assets/sounds/rooster.wav';

const CustomNavbar = styled(Navbar)`
  color: #ffffff;
  z-index: 1;
`;

const CustomNavbarBrand = styled(Nav.Link)`
  color: white;
  font-size: 1.5rem;
  &:hover {
    color: white;
    text-decoration: underline;
    text-decoration-color: #ffc108;
  }
`;

const NavigationBar = ({ location }) => {
  const match = matchPath(location.pathname, {
    path: '/gameSessions/:id',
    exact: true,
    strict: false,
  });
  const [status, setStatus] = useState(null);
  const [sound, setSound] = useState(true);

  useEffect(() => {
    if (match) {
      try {
        db.ref(`/gameSessions/${match.params.id}/status`).on('value', function (
          snapshot
        ) {
          if (snapshot.val()) {
            setStatus(snapshot.val());
          }
        });
      } catch (error) {
        console.error('Error in NavigationBar useEffect', error.message);
      }
    }
  }, [match, status]);

  const mute = () => {
    setSound(!sound);
  };

  return (
    <CustomNavbar>
      {status === 'roleSelect' && sound ? (
        <Sound
          url={sillyBackground}
          playStatus={Sound.status.PLAYING}
          autoLoad="true"
          loop="true"
        />
      ) : status === 'nightPhase' && sound ? (
        <Sound url={howl} playStatus={Sound.status.PLAYING} autoLoad="true" />
      ) : status === 'dayPhase' && sound ? (
        <Sound
          url={rooster}
          playStatus={Sound.status.PLAYING}
          autoLoad="true"
        />
      ) : status === 'voting' && sound ? (
        <Sound
          url={sillyBackground}
          playStatus={Sound.status.PLAYING}
          autoLoad="true"
          loop="true"
        />
      ) : status === 'results' && sound ? (
        <Sound
          url={sillyBackground}
          playStatus={Sound.status.PLAYING}
          autoLoad="true"
          loop="true"
        />
      ) : !status && sound ? (
        <Sound
          url={sillyBackground}
          playStatus={Sound.status.PLAYING}
          autoLoad="true"
          loop="true"
        />
      ) : null}
      <CustomNavbarBrand className="d-flex align-items-center" href="/">
        <img alt="" src={logo} width="30" height="30" />{' '}
        <div className="ml-2">Ultimate Werewolf</div>
      </CustomNavbarBrand>
      <Button onClick={() => mute()}>Mute</Button>
    </CustomNavbar>
  );
};

export default withRouter(NavigationBar);
