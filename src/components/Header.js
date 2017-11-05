import React, { Component } from 'react';

export default (props) => {
	return (
		<header id="header">
			<a href={props.link} className="logo"><strong>{props.title}</strong></a>
		</header>
	)
}
