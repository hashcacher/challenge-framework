import React from 'react';
import ReactDOM from 'react-dom';
import './styles/index.css';
import './styles/base.css';
import './styles/khanacademy.css';
import AppContainer from './App';
import registerServiceWorker from './registerServiceWorker';

ReactDOM.render(<AppContainer />, document.getElementById('root'));
registerServiceWorker();
