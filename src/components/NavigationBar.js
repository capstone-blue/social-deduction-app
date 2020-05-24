/* eslint-disable complexity */
import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { matchPath, withRouter } from 'react-router';
import styled from 'styled-components';
import Navbar from 'react-bootstrap/Navbar';
import Nav from 'react-bootstrap/Nav';
import Button from 'react-bootstrap/Button';
import logo from '../assets/animals.svg';
import Sound from 'react-sound';
import sillyBackground from '../assets/sounds/sillyBackground.mp3';
import detectiveBackground from '../assets/sounds/detectiveBackground.mp3';
import nightBackground from '../assets/sounds/nightBackground.mp3';
import morningBackground from '../assets/sounds/morningBackground.mp3';
import howl from '../assets/sounds/howl.mp3';
import rooster from '../assets/sounds/rooster.mp3';

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
    } else {
      setStatus('lobby');
    }
  }, [match, status]);

  const mute = () => {
    setSound(!sound);
  };

  return (
    <CustomNavbar>
      {status === 'roleSelect' && sound ? (
        <Sound
          url={detectiveBackground}
          playStatus={Sound.status.PLAYING}
          autoLoad={true}
          loop={true}
          volume={10}
        />
      ) : status === 'nightPhase' && sound ? (
        <React.Fragment>
          <Sound
            url={howl}
            playStatus={Sound.status.PLAYING}
            autoLoad="true"
            volume={20}
          />
          <Sound
            url={nightBackground}
            playStatus={Sound.status.PLAYING}
            autoLoad="true"
            volume={10}
          />
        </React.Fragment>
      ) : status === 'dayPhase' && sound ? (
        <React.Fragment>
          <Sound
            url={rooster}
            playStatus={Sound.status.PLAYING}
            autoLoad={true}
            volume={20}
          />
          <Sound
            url={morningBackground}
            playStatus={Sound.status.PLAYING}
            autoLoad={true}
            loop={true}
            volume={10}
          />
        </React.Fragment>
      ) : status === 'voting' && sound ? (
        <Sound
          url={sillyBackground}
          playStatus={Sound.status.PLAYING}
          autoLoad={true}
          loop={true}
          volume={10}
        />
      ) : status === 'results' && sound ? (
        <Sound
          url={sillyBackground}
          playStatus={Sound.status.PLAYING}
          autoLoad={true}
          loop={true}
          volume={10}
        />
      ) : null}
      <CustomNavbarBrand className="d-flex align-items-center" href="/">
        <img alt="" src={logo} width="30" height="30" />{' '}
        <div className="ml-2">Ultimate Werewolf</div>
      </CustomNavbarBrand>
      {sound ? (
        <Button variant="dark" onClick={() => mute()}>
          <i className="fas fa-volume-mute" />
        </Button>
      ) : null}
      {!sound ? (
        <Button variant="dark" onClick={() => mute()}>
          <i className="fas fa-volume-up" />
        </Button>
      ) : null}
    </CustomNavbar>
  );
};

export default withRouter(NavigationBar);
