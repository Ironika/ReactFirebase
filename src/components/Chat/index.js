import React, { Component } from 'react';
import { withAuthorization } from '../Session';
import { withFirebase } from '../Firebase';
import EmojiPicker from 'emoji-picker-react';
import JSEMOJI from 'emoji-js';
import iconSend from '../../assets/img/icon-send.png';
import iconUpload from '../../assets/img/icon-upload.png';
import UserList from './userList';
import ThreadList from './threadList';
import CreateThread from './createThread';

let jsemoji = new JSEMOJI();
jsemoji.img_set = 'emojione';
jsemoji.img_sets.emojione.path = 'https://cdn.jsdelivr.net/emojione/assets/3.0/png/32/';

class Chat extends Component {
  constructor(props) {
    super(props);

    this.state = {
      loading: false,
      loadingUser: true,
      threads: [],
      thread: '',
      users: [],
      user_uid: this.props.firebase.auth.currentUser.uid,
      user:'',
      content: '',
      formCreateThreadIsOpen: false,
      usersThread: [],
      selectedOption: null,
      url: '',
      thread_name: '',
      thread_multi_url: '',
      create_thread_error: '',
      messagesState: [],
      showEmojis: false,
      showUserList: true
    };
  }

  componentDidMount() {
    this.setState({ loading: true, loadingUser: true });

    this.props.firebase.user(this.props.firebase.auth.currentUser.uid).on("value", function(snapshot) {
		  this.setState({user: snapshot.val()});
		}.bind(this));

    this.props.firebase.users().on('value', snapshot => {
      const usersObject = snapshot.val();

      const usersList = Object.keys(usersObject).map(key => ({
        ...usersObject[key],
        uid: key,
      }));

      this.setState({
        users: usersList,
        loadingUser: false,
      });
    });

    this.props.firebase.threads().on('value', snapshot => {
      const threadsObject = snapshot.val();

      if(threadsObject) {
	      const threadsList = Object.keys(threadsObject).map(key => ({
	        ...threadsObject[key],
	        uid: key,
	      }));

	     	let threads = [];
		    for(let key in threadsList) {
		    	this.props.firebase.messages(threadsList[key].uid).on('value', snapshot => {
		    		const messagesObject = snapshot.val();
		    		if(messagesObject) {
		    			let thread = threadsList[key];
		    			thread.messages = messagesObject;
		    			threads.push(thread);
		    		} else {
		    			threads.push(threadsList[key]);
		    		}
		    	});
		    }

		    threads = threads.filter(thread => this.isInThread(thread, this.state.user_uid))

	      this.setState({ threads: threads, loading: false });
	    }
    });

	  this.props.firebase.messagesState().on('value', snapshot => {
			this.setState({messagesState : snapshot.val()});
		});

    this.props.firebase.url('affiliates-512.png').getDownloadURL()
  	.then( url => {
  		this.setState({thread_multi_url: url });
  	});

  }

  componentWillUnmount() {
    this.props.firebase.threads().off();
    this.props.firebase.users().off();
    this.props.firebase.user().off();
    this.props.firebase.messages().off();
  }

  createThread() {
  	if(this.state.thread_name !== '' && this.state.selectedOption !== null) {
	  	let uid = (new Date().getTime() + Math.floor((Math.random()*10000)+1)).toString(16);
	  	let date = new Date();

	  	let currentUser = {
	  		uid: this.state.user_uid,
	  		email: this.state.user.email,
	  		url: this.state.user.url,
	  		username: this.state.user.username
	  	}

	  	let users = [];
	  	users.push(currentUser);
	  	for(let key in this.state.selectedOption) {
	  		users.push(this.getUser(this.state.selectedOption[key].value));
	  	}

	  	this.props.firebase
	      .thread(uid)
	      .set({
	        users: users,
	        created_at: date.toString(),
	        uid: uid,
	        name: this.state.thread_name
	      });
	      this.setState({formCreateThreadIsOpen: false, usersThread: []})
	  } else {
	  	this.setState({create_thread_error: 'All fields must be fill.'})
	  }
  }

  cancelCreateThread() {
  	this.setState({formCreateThreadIsOpen: false})
  }

  sendMsg() {
  	if(this.state.content !== '' && this.state.content !== "\n") {
  		let thread = this.state.thread;
	  	let date = new Date();
	  	let uid = (new Date().getTime() + Math.floor((Math.random()*10000)+1)).toString(16);

	  	let msg = {
	  		content: this.state.content, 
	  		sended_at: date.toString(), 
	  		user: {
	  			uid: this.state.user_uid,
	  			username: this.getUser(this.state.user_uid).username
	  		},
	  		uid: uid
	    };

	    if(!thread.messages)
	    	thread.messages = [];

	  	thread.messages.push(msg);

	  	this.props.firebase
	      .messages(this.state.thread.uid)
	      .set(thread.messages);

	    let msgReads = [];
	    let read = {};
	    for(let key in thread.users) {
	    	if(thread.users[key].uid !== this.state.user_uid) {
	    		read[thread.users[key].uid] = false;
	    	} else {
	    		read[thread.users[key].uid] = true;
	    	}
	    	msgReads.push(read);
	    }

	    this.props.firebase.messagesStateThreadMsg(thread.uid, uid).set(msgReads);

	    this.setState({content: '', showEmojis: false})
	    setTimeout(function(){ 
	  		var scroll = document.getElementById('chat');
	  		scroll.scrollTop = scroll.scrollHeight;
	  		scroll.animate({scrollTop: scroll.scrollHeight});
			}, 0);
  	}
  }

  getUser(user_uid) {
  	for(let key in this.state.users) {
  		if(this.state.users[key].uid === user_uid)
  			return this.state.users[key];
  	}
  	return null;
  }

  change(input, e) {
  	if(input === 'content')
  		this.setState({'content': e.target.value})
  }

  handleClickThread(thread) {
  	this.msgIsRead(thread)
  	this.setState({thread: thread, formCreateThreadIsOpen: false});
  	setTimeout(function(){ 
  		var scroll = document.getElementById('chat');
  		scroll.scrollTop = scroll.scrollHeight;
  		scroll.animate({scrollTop: scroll.scrollHeight});
		}, 50);
  }

  isInThread(thread, user_uid) {
		for(let key in thread.users) {
			if(thread.users[key].uid === user_uid) {
				return true;
			}
		}
  	return false;
  }

  getImgThread(thread) {
  	if(thread.users.length < 3) {
	  	for(let key in thread.users){
	  		if(thread.users[key].username !== this.state.user.username)
	  			return thread.users[key].url;
	  		else
	  			return thread.users[1].url;
	  	}
	  } else {
	    return this.state.thread_multi_url;
	  }
  	return '';
  }

  getThreadName(thread) {
		for(let key in thread.users) {
			if(thread.users[key].username !== this.state.user.username)
				return thread.users[key].username;
		}
  }

  getThreadByUser(user) {
  	let threads = this.state.threads;

  	for(let i in threads) {
  		for(let y in threads[i].users) {
  			if(threads[i].users.length < 3 && threads[i].users[y].uid === user.uid) {
  				return threads[i];
  			}
  		}
  	}

  	return false;
  }

  handleClickUser(user) {
  	let thread = this.getThreadByUser(user)
  	if(thread)
  		this.setState({thread: thread});
  	else {
  		let uid = (new Date().getTime() + Math.floor((Math.random()*10000)+1)).toString(16);
	  	let date = new Date();
	  	let currentUser = {
	  		uid: this.state.user_uid,
	  		email: this.state.user.email,
	  		url: this.state.user.url,
	  		username: this.state.user.username
	  	}

	  	let new_thread = {
	  		users: [
	        	currentUser,
	        	user
	        ],
        messages: [],
        created_at: date.toString(),
        uid: uid,
        name: ''
	  	}

	  	this.props.firebase.thread(uid).set(new_thread);

	  	this.props.firebase.messages(new_thread.uid).on('value', snapshot => {
    		const messagesObject = snapshot.val();
    		if(messagesObject) {
    			new_thread.messages = messagesObject;
    		}
    	});
	    this.setState({thread: new_thread})
  	}
  }

  async handleClickRemove(thread_uid) {
  	await this.props.firebase.thread(thread_uid).remove();
  	await this.props.firebase.messagesStateThread(thread_uid).remove();
  	this.setState({thread: ''});
  }

  msgIsRead(thread) {
  	let messagesStateThread = this.state.messagesState[thread.uid]
  	if(messagesStateThread) {
  		for(let key in messagesStateThread) {
				for(let key2 in messagesStateThread[key]) {
						messagesStateThread[key][key2][this.state.user_uid] = true;
				}
			}

			this.props.firebase.messagesStateThread(thread.uid).set(messagesStateThread);
  	}
  }

  haveUnreadMsg(thread) {
  	if(!this.state.messagesState)
  		return false;

		for(let key in this.state.messagesState[thread.uid]) {
			for(let key2 in this.state.messagesState[thread.uid][key]) {
				if(!this.state.messagesState[thread.uid][key][key2][this.state.user_uid]) {
					 return true;
				}
			}
		}
		return false;
  }

  handleShowUserList() {
  	this.setState({showUserList: !this.state.showUserList});
  }

  handleKeyPress(event) {
    if (event.key === 'Enter' && !event.shiftKey)
    	this.sendMsg();
  }

  handleScrollChat(e) {
  	if(this.haveUnreadMsg(this.state.thread))
	  	if(e.currentTarget.scrollTop === (e.currentTarget.scrollHeight - 380) || e.currentTarget.scrollTop === (e.currentTarget.scrollHeight - 530))
	  		this.msgIsRead(this.state.thread);
  }

  handleEmojiClick(code, emoji) {
  	let emojiPic = jsemoji.replace_colons(`:${emoji.name}:`);
  	this.setState({content: this.state.content + emojiPic});
  }

  showEmojis() {
  	this.setState({showEmojis: !this.state.showEmojis});
  }

  parseUrl(content) {
  	let matches, url;

  	matches = content.match(/\[url\]\S*\[\/url\]/g);
  	if(matches) {
	  	for(let key in matches) {
	  		url = matches[key].replace('[url]', '');
	  		url = url.replace('[/url]', '');
	  		content = content.replace(matches[key], '<br/><br/><img class="chat-img" alt="content img" src="' + url + '"/><br/><br/>')
	  	}
	  }

	  matches = content.match(/http\S*/g);
	  if(matches) {
	  	for(let key in matches) {
	  		if(!matches[key].includes('"/>'))
	  			if(matches[key].includes('.gif') || matches[key].includes('.png') || matches[key].includes('.jpg') || matches[key].includes('.jpeg'))
	  				content = content.replace(matches[key], '<br/><br/><iframe width="300" height="200" src="' + matches[key] + '"></iframe><br/><br/>')
	  			else
	  				content = content.replace(matches[key], '<a target="_blank" href="' + matches[key] + '">' + matches[key] + '</a>')
	  	}
	  }

  	return content;
  }

  handleClickUpload() {
  	this.refs.fileUploader.click();
  }

  async handleChangeUpload(e) {
  	let file = e.target.files[0]
  	await this.props.firebase.threadImg(this.state.thread.uid, file.name).put(file);

    this.props.firebase.threadImg(this.state.thread.uid, file.name).getDownloadURL()
    .then( url => {
    	this.setState({content: this.state.content + '[url]' + url + '[/url]'});
    });
  }

  handleChangeUsersThread(selectedOption) {
  	this.setState({ selectedOption });
  }

  displayFormCreateThread() {
  	this.setState({formCreateThreadIsOpen: true})
  }

  getOptions() {
  	let options = [];
  	for(let key in this.state.users) {
  		if(this.state.users[key].uid !== this.state.user_uid)
  			options.push({value: this.state.users[key].uid, label: this.state.users[key].username})
  	}
  	return options;
  }

  handleChangeThreadName(e) {
  	this.setState({thread_name: e.target.value})
  }

  chatbox() {
  	return (
      <React.Fragment>
      	{this.state.thread.users.length > 2 && 
      		<ul className="chat-users-list-chat">
				    {this.state.thread.users.filter(user => user.uid !== this.state.user_uid).map(user => (
				      <li key={user.uid}>
				      	<img src={user.url} alt='user img'/>
				      	<p>
				          <strong>{user.username}</strong> 
				        </p>
				      </li>
				    ))}
				  </ul>
				}
        <ul className={this.state.showUserList ? "chat-box" : "chat-box chat-box-full"} id="chat" onScroll={this.handleScrollChat.bind(this)}>
          {this.state.thread.messages && this.state.thread.messages.map((message, index) => {
          	let date = new Date(message.sended_at);
            return message.user.uid === this.state.user_uid ? 
            <li className="sender" key={index}><p><span>{date.toLocaleDateString() + ' ' + date.toLocaleTimeString()}</span><br/><br/><span dangerouslySetInnerHTML={{__html: this.parseUrl(message.content)}}></span></p></li> : 
            <li key={index}><p><span>{this.state.thread.users.length < 3 ? date.toLocaleDateString() + ' ' + date.toLocaleTimeString() : date.toLocaleDateString() + ' ' + date.toLocaleTimeString() + ' - ' + message.user.username}</span><br/><br/><span dangerouslySetInnerHTML={{__html: this.parseUrl(message.content)}}></span></p></li>
          })}
        </ul>
        <div className="send-block">
	        <textarea placeholder="Type your text ..." value={this.state.content} onChange={this.change.bind(this, 'content')} onKeyPress={this.handleKeyPress.bind(this)}></textarea>
	        <span className="showEmojis" onClick={this.showEmojis.bind(this)}>{'😎'}</span>
	        <img className="uploadFileIcon" onClick={this.handleClickUpload.bind(this)} src={iconUpload} alt='icon upload'/>
	        <input type='file' hidden id='upload' ref="fileUploader" onChange={this.handleChangeUpload.bind(this)}/>
	        {this.state.showEmojis && <EmojiPicker onEmojiClick={this.handleEmojiClick.bind(this)}/>}
	        <button className="send-msg" onClick={this.sendMsg.bind(this)}><img src={iconSend} alt='icon send'/></button>
	      </div>
      </React.Fragment>
    )
  }

  render() {
    const { loading, loadingUser } = this.state;

    return (
      <div className='webchat'>
        {loadingUser && <div>Loading Users...</div>}
        <UserList 
        	handleShowUserList={this.handleShowUserList.bind(this)} 
        	showUserList={this.state.showUserList} 
        	users={this.state.users} 
        	handleClickUser={this.handleClickUser.bind(this)} 
        	user_uid={this.state.user_uid}
        />
        <div className="container">
	      	<div className="box-left">
	      		<span className="add-thread" title="add new chat" onClick={this.displayFormCreateThread.bind(this)}>+</span>
	      		{loading && <div>Loading Threats...</div>}
			      <ThreadList 
			      	threads={this.state.threads} 
			      	thread={this.state.thread} 
			      	handleClickThread={this.handleClickThread.bind(this)} 
			      	getThreadName={this.getThreadName.bind(this)} 
			      	haveUnreadMsg={this.haveUnreadMsg.bind(this)} 
			      	handleClickRemove={this.handleClickRemove.bind(this)} 
			      	getImgThread={this.getImgThread.bind(this)}
			      />
			    </div>
			    {
			    	this.state.formCreateThreadIsOpen &&
			    	<div className="box-right">
				    	<CreateThread 
				    		handleChangeThreadName={this.handleChangeThreadName.bind(this)}
				    		selectValue={this.state.selectedOption}
				    		handleChangeUsersThread={this.handleChangeUsersThread.bind(this)}
				    		getOptions={this.getOptions.bind(this)}
				    		cancelCreateThread={this.cancelCreateThread.bind(this)}
				    		createThread={this.createThread.bind(this)}
				    	/>
				    	{this.state.create_thread_error !== '' && <p>{this.state.create_thread_error}</p>}
			      </div>
		     	}
		     	{ (this.state.thread !== '' && !this.state.formCreateThreadIsOpen) &&
		       <div className="box-right">
		       	<div className="box-right-container">
		        	{this.chatbox()}
		        </div>
		       </div>
		      }
		    </div>
      </div>
    );
  }
}

const condition = authUser => !!authUser;

export default withAuthorization(condition)(withFirebase(Chat));