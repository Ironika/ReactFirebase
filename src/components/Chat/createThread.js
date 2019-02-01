import React from 'react';
import Select from 'react-select';

const CreateThread = (props) => (
	<div className="form-thread">
  		<input type='text' onChange={props.handleChangeThreadName} placeholder='Enter name thread' className="form-thread-input"/>
  		<br/>
  		<br/>
		<Select
	        value={props.selectedOption}
	        onChange={props.handleChangeUsersThread}
	        options={props.getOptions()}
	        isMulti={true}
	        className="form-thread-select"
	    />
      	<br/>
      	<button onClick={props.cancelCreateThread} style={{marginRight: '10px'}}>Cancel</button>
		<button onClick={props.createThread}>Create</button>
  	</div>
);

export default CreateThread;