import React from 'react'
import Navbar from 'react-bootstrap/Navbar';

const NavigationBar = () => {
  return (
    <Navbar bg="dark" variant="dark">
      <Navbar.Brand href="/">
        <img
          alt=""
          src="../../public/logo.png"
          width="30"
          height="30"
          className="d-inline-block align-top"
        />One Night Ultimate Werewolf
    </Navbar.Brand>
    </Navbar>
  )
}

export default NavigationBar

