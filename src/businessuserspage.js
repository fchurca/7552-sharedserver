import React, { Component} from 'react';
import ReactDOM from 'react-dom';

import { Footer, Menu, Header, Banner, GeneralStats } from './components';

class BusinessUsersPage extends Component {

  render() {
    return (

      <div id="wrapper">

        <div id="main">
          <div className="inner">

              <Header title="BusinessUsersPage Header" link="/"/>

              <Banner title="BusinessUsersPage" subtitle="A free and fully responsive site template"
              content="Hello, BusinessUsers"/>
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

ReactDOM.render(<BusinessUsersPage />, document.getElementById('businessuserspage'));