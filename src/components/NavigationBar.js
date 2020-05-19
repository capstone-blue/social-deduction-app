import React from 'react';
import styled from 'styled-components';
import Navbar from 'react-bootstrap/Navbar';
import Nav from 'react-bootstrap/Nav';
import logo from '../assets/logo.jpeg';

const CustomNavbar = styled(Navbar)`
  background-color: #2a4365;
`;

const NavigationBar = () => {
  return (
    <CustomNavbar>
      <Navbar.Brand style={{ color: 'white' }} href="/">
        <img
          alt=""
          src={logo}
          width="30"
          height="30"
          className="d-inline-block align-top"
        />{' '}
        One Night: Ultimate Werewolf
      </Navbar.Brand>
      <Nav.Link style={{ color: '#63B3ED' }} href="/">
        Return to Lobby (not working)
      </Nav.Link>
      <Nav.Link style={{ color: '#63B3ED' }} href="/">
        Return to Game (not working)
      </Nav.Link>
    </CustomNavbar>
  );
};

export default NavigationBar;
