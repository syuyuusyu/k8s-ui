
import './config/util';
import React from 'react';
import ReactDOM from 'react-dom';
import { Router } from 'react-router-dom';
import { Provider } from 'mobx-react';
import { createBrowserHistory } from 'history';
import RootStore from './config/rootStore';
import { Main } from './modules/main'



const history = createBrowserHistory();

// 等待 access_token 就绪后再加载页面
function waitForToken() {
    return new Promise((resolve) => {
        // 如果 token 已经存在，直接 resolve
        if (sessionStorage.getItem('access_token')) {
            resolve();
            return;
        }
        
        // 监听 SET_TOKEN 消息
        const handleMessage = (event) => {
            if (event.data.type === 'SET_TOKEN' && event.data.token) {
                sessionStorage.setItem('access_token', event.data.token);
                window.removeEventListener('message', handleMessage);
                resolve();
            }
        };
        
        window.addEventListener('message', handleMessage);
    });
}

// Token 就绪后再初始化应用
waitForToken().then(() => {
    history.push('/k8s/no');
    
    ReactDOM.render(
        <Provider rootStore={new RootStore(history)} >
            <Router history={history}>
                <Main />
            </Router>
        </Provider>,
        document.getElementById('app')
    );
});

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

