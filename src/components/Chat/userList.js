import React from 'react';

const UserList = (props) => (
	<div className="userList">
		<span className="showUserList" onClick={props.handleShowUserList}>{props.showUserList ? 'hide' : 'show users'}</span>
		{props.showUserList && 
			<ul className="chat-users-list">
		    {props.users.filter(user => user.uid !== props.user_uid).map(user => (
		      <li key={user.uid} onClick={props.handleClickUser.bind(this, user)}>
		      	<img src={user.url} alt='user img'/>
		      	<p>
		          <strong>{user.username}</strong> 
		        </p>
		      </li>
		    ))}
		  </ul>
		}
	</div>
);

export default UserList;