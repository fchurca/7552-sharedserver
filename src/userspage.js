import React, { Component} from 'react';
import ReactDOM from 'react-dom';

import { Footer, Menu, Header, Banner, GeneralStats } from './components';

class UsersPage extends Component {

  render() {
    return (

      <div id="wrapper">

        <div id="main">
          <div className="inner">

              <Header title="UsersPage Header" link="/"/>

              <Banner title="UsersPage" subtitle="A free and fully responsive site template"
              content="Hello, Users"/>
          </div>
        </div>

        <div id="sidebar">
          <div className="inner">
            <Menu />
            <Footer />
          </div>
        </div>
      </div>
    )
  }
}

ReactDOM.render(<UsersPage />, document.getElementById('userspage'));