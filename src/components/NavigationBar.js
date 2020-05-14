import React from 'react'
import Navbar from 'react-bootstrap/Navbar';
import Nav from 'react-bootstrap/Nav';
import logo from '../assets/logo.jpeg'

const NavigationBar = () => {
  return (
    <Navbar bg="dark" variant="dark">
      <Navbar.Brand href="/">
        <img
          alt=""
          src={logo}
          width="30"
          height="30"
          className="d-inline-block align-top"
        /> One Night Ultimate Werewolf
    </Navbar.Brand>
      <Nav.Link href="/">Return to Lobby (not working)</Nav.Link>
      <Nav.Link href="/">Return to Game (not working)</Nav.Link>
    </Navbar>
  )
}

export default NavigationBar

