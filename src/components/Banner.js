import React, { Component } from 'react';

export default (props) => {
	return (
        <section id="banner">
          <div className="content">
            <header>
              <h1>{props.title}</h1>
              <p>{props.subtitle}</p>
            </header>
            <p>{props.content}</p>
            <ul className="actions">
              <li><a href="#" className="button big">Learn More</a></li>
            </ul>
          </div>
        </section>
	)
}
