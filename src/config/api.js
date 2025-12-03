/*
 * @Author: your name
 * @Date: 2020-07-09 13:47:35
 * @LastEditTime: 2020-07-09 13:54:02
 * @LastEditors: your name
 * @Description: In User Settings Edit
 * @FilePath: /k8s-ui/src/config/api.js
 */

const API = window.API;

export let host = 'http://74.48.18.221:9008';
export let wsUrl = `wss://74.48.18.221:9008/pod-terminal`;
export let nsUrl = 'http://74.48.18.221:9008/kube/allnamespace'
export let registryUrl = 'http://192.168.50.28:5000'


// export let host = 'https://www.51bqm.com:4022';
// export let wsUrl = `wss://www.51bqm.com:4022/pod-terminal`;
// export let nsUrl = 'https://www.51bqm.com:4022/kube/allnamespace'
// export let registryUrl = 'http://192.168.50.28:5000'

// export let host = 'http://127.0.0.1:9008';
// export let wsUrl = `ws://127.0.0.1:9008/pod-terminal`;
// export let nsUrl = 'http://127.0.0.1:9008/kube/allnamespace'
// export let registryUrl = 'https://swr.cn-north-1.myhuaweicloud.com'


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
