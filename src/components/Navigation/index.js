import React from 'react';
import { Link } from 'react-router-dom';
import * as ROUTES from '../../constants/routes';
import SignOutButton from '../SignOut';
import { AuthUserContext } from '../Session';
import logoNissan from '../../assets/img/nissan-logo.png';

const Navigation = () => (
  <React.Fragment>
    <AuthUserContext.Consumer>
      {authUser =>
        authUser && <NavigationAuth />
      }
    </AuthUserContext.Consumer>
  </React.Fragment>
);

const NavigationAuth = () => (
  <React.Fragment>
    <img src={logoNissan} className="logo"/>
    <ul className="nav">
      <li>
        <Link to={ROUTES.CHAT}>WebChat</Link>
      </li>
      <li>
        <Link to={ROUTES.ACCOUNT}>Account</Link>
      </li>
      <li>
        <SignOutButton />
      </li>
    </ul>
  </React.Fragment>
);

export default Navigation;