/*
 * @Author: your name
 * @Date: 2020-07-09 13:47:35
 * @LastEditTime: 2020-07-09 13:54:02
 * @LastEditors: your name
 * @Description: In User Settings Edit
 * @FilePath: /k8s-ui/src/config/api.js
 */

const API = window.API;

/* host */
export let host = "http://10.10.50.199:30082";
export let wsUrl = `ws://10.10.50.199:30082/pod-terminal`;
export let nsUrl = "http://10.10.50.199:30082/kube/allnamespace";

// export let host = 'http://10.10.25.1:8002';
// export let wsUrl = `ws://10.10.25.1:8002/pod-terminal`;
// export let nsUrl = 'http://10.10.25.1:8002/kube/allnamespace'

// export let host = 'http://172.16.11.131:8002';
// export let wsUrl = `ws://172.16.11.131:8002/pod-terminal`;
// export let nsUrl = 'http://172.16.11.131:8002/kube/allnamespace'

if (API) {
  host = API.host;
  wsUrl = API.wsUrl;
  nsUrl = API.nsUrl;
}
