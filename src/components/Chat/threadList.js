import React from 'react';

const ThreadList = (props) => (
	<ul className="thread-list">
      {props.threads && props.threads.map(thread => {
        return (
	        <li key={thread.uid} onClick={props.handleClickThread.bind(this, thread)} className={props.thread.uid === thread.uid ? 'thread-active' : ''}>
	        	<img src={props.getImgThread(thread)} alt='thread url'/>
	          <span className="thread-name">{thread.name !== '' ? thread.name : props.getThreadName(thread)}{props.haveUnreadMsg(thread) && <span className="haveUnreadMsg"></span>}</span>
	          <span className="remove" onClick={props.handleClickRemove.bind(this, thread.uid)}>x</span>
	        </li>
	      )
      })}
    </ul>
);

export default ThreadList;