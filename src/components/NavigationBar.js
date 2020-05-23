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
    text-decoration-color: #ffc108;
  }
`;

const NavigationBar = () => {
  return (
    <CustomNavbar>
      <CustomNavbarBrand className="d-flex align-items-center" href="/">
        <img alt="" src={logo} width="30" height="30" />{' '}
        <div className="ml-2">Ultimate Werewolf</div>
      </CustomNavbarBrand>
    </CustomNavbar>
  );
};

export default NavigationBar;
