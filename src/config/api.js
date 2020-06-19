const API = window.API

/* host */
export const host = 'http://127.0.0.1:8002';
export const wsUrl = `ws://127.0.0.1:8002/pod-terminal`;
export const nsUrl = 'http://127.0.0.1:8002/kube/allnamespace'

// export const host = 'http://10.10.50.108:8002';
// export const wsUrl = `ws://10.10.50.108:8002/pod-terminal`;
// export const nsUrl = 'http://10.10.50.108:8002/kube/allnamespace'


if (API) {
    host = API.host
    wsUrl = API.wsUrl
    nsUrl = API.nsUrl
}




