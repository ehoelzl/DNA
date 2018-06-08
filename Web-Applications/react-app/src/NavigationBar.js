import React, {Component} from 'react';
import {Navbar, Nav, NavItem, NavDropdown, MenuItem} from 'react-bootstrap';
import {LinkContainer} from 'react-router-bootstrap'

/*---------------------------------------------------------------------------------- DONE ----------------------------------------------------------------------------------*/
//TODO : Add About, Additional INfo and API
/*
* Class representing the Navigation Bar component
* */
export default class NavigationBar extends Component {

  render() {
    return (
      <Navbar inverse collapseOnSelect fixedTop fluid>
        <Navbar.Header>
          <Navbar.Brand>
            <LinkContainer to="/"><a>Decentralized Notary Application</a></LinkContainer>
          </Navbar.Brand>
          <Navbar.Toggle/>
        </Navbar.Header>
        <Navbar.Collapse>
          <Nav>
            <NavDropdown title="Time-stamping" id="basic-nav-dropdown">
              <LinkContainer to="/Timestamp"><MenuItem>Document timestamping (free)</MenuItem></LinkContainer>
              <LinkContainer to="/PersonalTimestamp"><MenuItem>Document timestamping and
                signing</MenuItem></LinkContainer>
              <MenuItem divider/>
              <LinkContainer to="/VerifyTimestamp"><MenuItem>Verify timestamp</MenuItem></LinkContainer>
            </NavDropdown>
            <NavDropdown title="File Sharing" id="basic-nav-dropdown">
              <LinkContainer to="/DepositFile"><MenuItem>Deposit a File</MenuItem></LinkContainer>
              <LinkContainer to="/Store"><MenuItem>Store</MenuItem></LinkContainer>
              <MenuItem divider/>
              <LinkContainer to="/MyFiles"><MenuItem>My Files</MenuItem></LinkContainer>
              <LinkContainer to="/MyRequests"><MenuItem>My requests</MenuItem></LinkContainer>
            </NavDropdown>
          </Nav>
          <Nav pullRight>
            <LinkContainer to="/About">
              <NavItem>About</NavItem>
            </LinkContainer>
          </Nav>
        </Navbar.Collapse>
      </Navbar>
    );
  }
}

