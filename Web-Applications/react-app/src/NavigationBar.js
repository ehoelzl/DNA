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
            <LinkContainer to="/Product">
              <NavItem>Product</NavItem>
            </LinkContainer>

            <NavDropdown title="Time-stamping" id="basic-nav-dropdown">
              <LinkContainer to="/Timestamp"><MenuItem>Document timestamping (free)</MenuItem></LinkContainer>
              <LinkContainer to="/PersonalTimestamp"><MenuItem>Document timestamping and
                signing</MenuItem></LinkContainer>
              <MenuItem divider/>
              <LinkContainer to="/VerifyTimestamp"><MenuItem>Verify timestamp</MenuItem></LinkContainer>
            </NavDropdown>
            <NavDropdown title="Patenting" id="basic-nav-dropdown">
              <LinkContainer to="/DepositPatent"><MenuItem>Deposit a new Patent</MenuItem></LinkContainer>
              <LinkContainer to="/RentPatent"><MenuItem>Buy access</MenuItem></LinkContainer>
              <MenuItem divider/>
              <LinkContainer to="/MyPatents"><MenuItem>My Patents</MenuItem></LinkContainer>
            </NavDropdown>
            <LinkContainer to="/About">
              <NavItem>About</NavItem>
            </LinkContainer>
          </Nav>

          <Nav pullRight>
            <LinkContainer to="/API">
              <NavItem>API</NavItem>
            </LinkContainer>
            <LinkContainer to="/AdditionalInfo"><NavItem>Additional information</NavItem></LinkContainer>
          </Nav>
        </Navbar.Collapse>
      </Navbar>
    );
  }
}

