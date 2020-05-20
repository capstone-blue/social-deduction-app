import React from 'react';
import styled from 'styled-components';
import Navbar from 'react-bootstrap/Navbar';
import Nav from 'react-bootstrap/Nav';
import logo from '../assets/animals.svg';

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
    text-decoration-color: #c22c31;
  }
`;

const NavigationBar = () => {
  return (
    <CustomNavbar>
      <CustomNavbarBrand className="d-flex align-items-center" href="/">
        <img alt="" src={logo} width="30" height="30" />{' '}
        <div className="ml-2">Ultimate Werewolf</div>
      </CustomNavbarBrand>
      {/* <Nav.Link style={{ color: '#63B3ED' }} href="/">
        Return to Lobby (not working)
      </Nav.Link>
      <Nav.Link style={{ color: '#63B3ED' }} href="/">
        Return to Game (not working)
      </Nav.Link> */}
    </CustomNavbar>
  );
};

export default NavigationBar;
