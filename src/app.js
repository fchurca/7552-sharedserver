import React, { Component} from 'react';
import ReactDOM from 'react-dom';

import { Footer, Menu, Header, Banner, GeneralStats } from './components';

// Terminal 1
// ./node_modules/.bin/webpack -w 
// Terminal 2
// npm start
// El index se va a ir actualizando solito

class App extends Component {

	render() {
		return (
      <div id="wrapper">

        <div id="main">
          <div className="inner">

              <Header title="Index Header" link="/"/>

              <Banner title="Title Banner" subtitle="Subtitle Banner"
              content="Aenean ornare velit lacus, ac varius enim ullamcorper eu. Proin aliquam facilisis ante interdum congue.
              Integer mollis, nisl amet convallis, porttitor magna ullamcorper, amet egestas mauris.
              Ut magna finibus nisi nec lacinia. Nam maximus erat id euismod egestas. Pellentesque sapien ac quam.
              Lorem ipsum dolor sit nullam."/>

              <GeneralStats/>
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

ReactDOM.render(<App />, document.getElementById('root'));
//export default App;


