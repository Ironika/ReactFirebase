import React from 'react';
import { Link } from 'react-router-dom';
import * as ROUTES from '../../constants/routes';
import SignOutButton from '../SignOut';
import { AuthUserContext } from '../Session';


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
  <ul className="nav">
    {/*<li>
      <Link to={ROUTES.HOME}>Home</Link>
    </li>*/}
    <li>
      <Link to={ROUTES.CHAT}>WebChat</Link>
    </li>
    <li>
      <Link to={ROUTES.ACCOUNT}>Account</Link>
    </li>
    {/*<li>
      <Link to={ROUTES.ADMIN}>Admin</Link>
    </li>*/}
    <li>
      <SignOutButton />
    </li>
  </ul>
);

// const NavigationNonAuth = () => (
//   <ul className="nav">
//     {<li>
//       <Link to={ROUTES.HOME}>Home</Link>
//     </li>}
//     <li>
//       <Link to={ROUTES.SIGN_IN}>Sign In</Link>
//     </li>
//   </ul>
// );

export default Navigation;