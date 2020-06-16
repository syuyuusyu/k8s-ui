
import './config/util';
import React from 'react';
import ReactDOM from 'react-dom';
import { Router } from 'react-router-dom';
import { Provider } from 'mobx-react';
import { createBrowserHistory } from 'history';
import RootStore from './config/rootStore';
import { Main } from './modules/main'


console.log(Main)
const history = createBrowserHistory();




ReactDOM.render(
    <Provider rootStore={new RootStore(history)} >
        <Router history={history}>
            <Main />
        </Router>
    </Provider>,
    document.getElementById('app')
);

// export default class K8sUi extends React.Component {

//     render() {

//         return (
//             <Provider rootStore={new RootStore(history)} >
//                 <Router history={history}>
//                     <Main />
//                 </Router>
//             </Provider>
//         )

//     }

// }

