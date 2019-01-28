import React, { Component } from 'react';

import { AuthUserContext, withAuthorization } from '../Session';

class AccountPage extends Component {
  constructor(props) {
    super(props);

    this.state = {
    	files: [],
    	url: '',
    	user: {}
    };
  }

  async componentDidMount() {
  	this.props.firebase.user(this.props.firebase.auth.currentUser.uid).on("value", function(snapshot) {
	  this.setState({user: snapshot.val()});
	}.bind(this));
  }

  componentWillUnmount() {
    this.props.firebase.user().off();
  }

  handleChangeUploadFile(evt) {
    let files = this.state.files;
    for(let i = 0; i < evt.target.files.length; i++)
        files.push(evt.target.files[i]);

    this.setState({files: files});
  }

  async uploadFile() {
  	let upload = await this.props.firebase.avatars().child(this.state.files[0].name).put(this.state.files[0]);

    this.props.firebase.avatar(this.state.files[0].name).getDownloadURL()
    .then( url => {
    	this.props.firebase.user(this.props.firebase.auth.currentUser.uid).update({url});
    	this.setState({files: []});
    });
  }

  render() {
  	return <AuthUserContext.Consumer>
	    {authUser => (
	      <div className="account">
	        <h1>{this.state.user.email}</h1>
	        <img src={this.state.user.url} alt='profile img' />
	        <br/>
	        <input type='file' onChange={this.handleChangeUploadFile.bind(this)} />
	        <button onClick={this.uploadFile.bind(this)}>Upload</button>
	      </div>
	    )}
	</AuthUserContext.Consumer>
  }
  
}

const condition = authUser => !!authUser;

export default withAuthorization(condition)(AccountPage);