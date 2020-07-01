/*
 * @Author: your name
 * @Date: 2020-07-01 13:44:24
 * @LastEditTime: 2020-07-01 13:45:53
 * @LastEditors: your name
 * @Description: In User Settings Edit
 * @FilePath: /k8s-ui/src/config/api.js
 */ 
const API = window.API

/* host */
// export let host = 'http://127.0.0.1:8002';
// export let wsUrl = `ws://127.0.0.1:8002/pod-terminal`;
// export let nsUrl = 'http://127.0.0.1:8002/kube/allnamespace'

// export let host = 'http://10.10.25.1:8002';
// export let wsUrl = `ws://10.10.25.1:8002/pod-terminal`;
// export let nsUrl = 'http://10.10.25.1:8002/kube/allnamespace'

export let host = 'http://172.16.11.131:8002';
export let wsUrl = `ws://172.16.11.131:8002/pod-terminal`;
export let nsUrl = 'http://172.16.11.131:8002/kube/allnamespace'


if (API) {
    host = API.host
    wsUrl = API.wsUrl
    nsUrl = API.nsUrl
}




