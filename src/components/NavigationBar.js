import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { useObjectVal } from 'react-firebase-hooks/database';
import { matchPath, withRouter } from 'react-router';
import styled from 'styled-components';
import Navbar from 'react-bootstrap/Navbar';
import Nav from 'react-bootstrap/Nav';
import logo from '../assets/animals.svg';
import Sound from 'react-sound';
import happyBackground from '../assets/sounds/happyBackground.wav';
import sillyBackground from '../assets/sounds/sillyBackground.wav';

// const match = matchPath("gameSessions/gameSessionId/", {
//   path: "/gameSessions/:id",
//   exact: true,
//   strict: false
// });

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
  const gameRef = db.ref(`/gameSessions/${match.params.id}`);
  const [status] = useObjectVal(gameRef.child('status'));

  return (
    <CustomNavbar onClick={() => console.log(status)}>
      {status === 'voting' ? (
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
    </CustomNavbar>
  );
};

export default withRouter(NavigationBar);
