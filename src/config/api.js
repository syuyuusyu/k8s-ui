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
// export let host = "http://10.10.50.199:30082";
// export let wsUrl = `ws://10.10.50.199:30082/pod-terminal`;
// export let nsUrl = "http://10.10.50.199:30082/kube/allnamespace";
// export let registryUrl = 'http://10.10.50.199:5000'


// export let host = 'http://192.168.50.28:8002';
// export let wsUrl = `ws://192.168.50.28:8002/pod-terminal`;
// export let nsUrl = 'http://192.168.50.28:8002/kube/allnamespace'
// export let registryUrl = 'http://192.168.50.28:5000'

export let host = 'http://127.0.0.1:8002';
export let wsUrl = `ws://127.0.0.1:8002/pod-terminal`;
export let nsUrl = 'http://127.0.0.1:8002/kube/allnamespace'
export let registryUrl = 'http://127.0.0.1:5000'


if (API) {
	host = API.HOST;
	wsUrl = API.HOST.replace(/http(?:s?)(:\/\/\d+.\d+.\d+.\d+:\d+)/, 'ws$1/pod-terminal');
	nsUrl = API.HOST + '/kube/allnamespace';
	if (API.REGISTRY) {
		registryUrl = API.REGISTRY
	}
	if (API.NSURL) {
		nsUrl = API.NSURL
	}
}
