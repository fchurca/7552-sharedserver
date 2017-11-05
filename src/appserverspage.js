import React, { Component} from 'react';
import ReactDOM from 'react-dom';

import { Footer, Menu, Header, Banner, GeneralStats } from './components';

class AppServersPage extends Component {

  render() {
    return (

      <div id="wrapper">

        <div id="main">
          <div className="inner">

              <Header title="AppServersPage Header" link="/"/>

              <Banner title="AppServersPage" subtitle="A free and fully responsive site template"
              content="Hello, AppServersPage"/>
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

ReactDOM.render(<AppServersPage />, document.getElementById('appserverspage'));