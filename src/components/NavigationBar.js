import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import styled from 'styled-components';
import Navbar from 'react-bootstrap/Navbar';
import Nav from 'react-bootstrap/Nav';
import logo from '../assets/animals.svg';
import Sound from 'react-sound';
import happyBackground from '../assets/sounds/happyBackground.wav';
import sillyBackground from '../assets/sounds/sillyBackground.wav';

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

const NavigationBar = ({ match }) => {
  const [page, setPage] = useState('');

  useEffect(() => {
    function listenOnPageStatus() {
      try {
        db.ref(`/gameSessions/${match.params.id}/status`).on('value', function (
          snapshot
        ) {
          if (snapshot.val()) {
            setPage(snapshot.val());
          }
        });
      } catch (e) {
        console.error('Error in VotingPage vote status listener', e.message);
      }
    }
    listenOnPageStatus();
  }, []);

  return (
    <CustomNavbar>
      {page === 'voting' ? (
        <Sound
          url={sillyBackground}
          // url="../assets/sounds/sillyBackground.wav"
          playStatus={Sound.status.PLAYING}
          autoLoad="true"
          loop="true"
        />
      ) : null}
      <CustomNavbarBrand className="d-flex align-items-center" href="/">
        <img alt="" src={logo} width="30" height="30" />{' '}
        <div className="ml-2">Ultimate Werewolf</div>
      </CustomNavbarBrand>
    </CustomNavbar>
  );
};

export default NavigationBar;
