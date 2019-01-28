import React from 'react';
import { BrowserRouter as Router, Route } from 'react-router-dom';

import Navigation from '../Navigation';
import ChatPage from '../Chat';
import SignUpPage from '../SignUp';
import SignInPage from '../SignIn';
import PasswordForgetPage from '../PasswordForget';
// import HomePage from '../Home';
import AccountPage from '../Account';
import AdminPage from '../Admin';

import * as ROUTES from '../../constants/routes';
import { withAuthentication } from '../Session';

const App = () => (
  <Router>
    <React.Fragment>
      <Navigation />

      {/*<Route exact path={ROUTES.HOME} component={HomePage} />*/}
      <Route exact path={ROUTES.SIGN_IN} component={SignInPage} />
      <Route path={ROUTES.CHAT} component={ChatPage} />
      <Route path={ROUTES.SIGN_UP} component={SignUpPage} />
      <Route
        path={ROUTES.PASSWORD_FORGET}
        component={PasswordForgetPage}
      />
      <Route path={ROUTES.ACCOUNT} component={AccountPage} />
      <Route path={ROUTES.ADMIN} component={AdminPage} />

      <footer>
        Publicis.Sapient © 2019.
      </footer>
    </React.Fragment>
  </Router>
);

export default withAuthentication(App);