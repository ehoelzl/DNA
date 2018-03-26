import React, { Component } from 'react';
import { Navbar,Nav, NavItem, NavDropdown, MenuItem} from 'react-bootstrap';
import {LinkContainer} from 'react-router-bootstrap'

export default class NavigationBar extends Component {

  render() {
    return (
      <Navbar inverse collapseOnSelect fixedTop fluid>
        <Navbar.Header>
          <Navbar.Brand>
            <LinkContainer to="/"><a>Decentralized Notary Application</a></LinkContainer>
          </Navbar.Brand>
          <Navbar.Toggle />
        </Navbar.Header>
        <Navbar.Collapse>
          <Nav>
            <LinkContainer to="/Product">
              <NavItem>Product</NavItem>
            </LinkContainer>
            <LinkContainer to="/About">
              <NavItem>About</NavItem>
            </LinkContainer>
            <NavDropdown eventKey={3} title="Services" id="basic-nav-dropdown">
              <LinkContainer to="/Timestamp"><MenuItem eventKey={3.1}>Document timestamping (free)</MenuItem></LinkContainer>
              <LinkContainer to="/PersonalTimestamp"><MenuItem eventKey={3.2}>Document timestamping and signing</MenuItem></LinkContainer>
              <MenuItem divider />
              <LinkContainer to="/VerifyTimestamp"><MenuItem eventKey={3.3}>Verify timestamp</MenuItem></LinkContainer>
            </NavDropdown>
          </Nav>
          <Nav pullRight>
            <LinkContainer to="/API">
              <NavItem>API</NavItem>
            </LinkContainer>
            <NavItem eventKey={2} href="#">
              Additional information
            </NavItem>
          </Nav>
        </Navbar.Collapse>
      </Navbar>
    );
  }
}

