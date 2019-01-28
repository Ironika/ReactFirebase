import React, { Component } from 'react';
import { Link, withRouter } from 'react-router-dom';
import { withFirebase } from '../Firebase';
import { compose } from 'recompose';
import { SignInLink } from '../SignIn';


import * as ROUTES from '../../constants/routes';

const INITIAL_STATE = {
  username: '',
  email: '',
  passwordOne: '',
  passwordTwo: '',
  error: null,
  file: '',
  url: ''
};

const SignUpPage = () => (
  <div className="signup">
    <h1>SignUp</h1>
    <SignUpForm />
    <SignInLink />
  </div>
);

class SignUpFormBase extends Component {
  constructor(props) {
    super(props);

    this.state = { ...INITIAL_STATE };
  }

  onSubmit = event => {
  	const { username, email, passwordOne } = this.state;
    const url = 'https://firebasestorage.googleapis.com/v0/b/mychat-98176.appspot.com/o/user.png?alt=media&token=336c3993-2c3b-443c-ad43-b56945280e7c'

    this.props.firebase
      .doCreateUserWithEmailAndPassword(email, passwordOne)
      .then(authUser => {
        // Create a user in realtime database
        return this.props.firebase
          .user(authUser.user.uid)
          .set({
            username,
            email,
            url
          });
      })
      .then(authUser => {
        this.setState({ ...INITIAL_STATE });
        this.props.history.push(ROUTES.CHAT);
      })
      .catch(error => {
        this.setState({ error });
      });

    event.preventDefault();
  }

  onChange = event => {
    this.setState({ [event.target.name]: event.target.value });
  };

  render() {
  	const {
      username,
      email,
      passwordOne,
      passwordTwo,
      error,
    } = this.state;

    const isInvalid =
      passwordOne !== passwordTwo ||
      passwordOne === '' ||
      email === '' ||
      username === '';

    return (
      <form onSubmit={this.onSubmit}>
        <label forhtml="username">Username :</label>
        <br/>
      	<input
          id="username"
          name="username"
          value={username}
          onChange={this.onChange}
          type="text"
          placeholder="Full Name"
        />
        <br/>
        <br/>
        <label forhtml="email">Email :</label>
        <input
          id="email"
          name="email"
          value={email}
          onChange={this.onChange}
          type="text"
          placeholder="Email Address"
        />
        <br/>
        <br/>
        <label forhtml="passwordOne">Password :</label>
        <input
          id="passwordOne"
          name="passwordOne"
          value={passwordOne}
          onChange={this.onChange}
          type="password"
          placeholder="Password"
        />
        <br/>
        <br/>
        <label forhtml="passwordTwo">Password Confirm :</label>
        <input
          id="passwordTwo"
          name="passwordTwo"
          value={passwordTwo}
          onChange={this.onChange}
          type="password"
          placeholder="Confirm Password"
        />
        <br/>
        <br/>
        <div className="cta">
          <button disabled={isInvalid} type="submit">Sign Up</button>
        </div>


        {error && <p>{error.message}</p>}
      </form>
    );
  }
}

const SignUpLink = () => (
  <p>
    Don't have an account? <Link to={ROUTES.SIGN_UP}>Sign Up</Link>
  </p>
);

const SignUpForm = compose(
  withRouter,
  withFirebase,
)(SignUpFormBase);

export default SignUpPage;

export { SignUpForm, SignUpLink };