import axios from 'axios';

export function request(method, url, body) {
    method = method.toUpperCase();
    let params;
    if (method === 'GET') {
        params = body;
        body = undefined;
    } else {
        body = body //&& JSON.stringify(body);
    }
    return axios({
        url: url,
        method: method,
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Access-Token': sessionStorage.getItem('access-token') || '',// 从sessionStorage中获取access token
        },
        data: body,
        params: params
    }).then((res) => {
        if (res.status === 401) {
            console.log('token失效!!');
            sessionStorage.clear();
            window.history.go('/login');
            return Promise.reject('Unauthorized.');
        } else {
            const token = res.headers['access-token'];
            if (token) {
                sessionStorage.setItem('access_token', token);
            }
            //console.log(res.json());
            return res.data;
        }
    }).catch((err) => {
        if (err.response.status === 401) {
            console.log('token失效!!');
            sessionStorage.clear();
            window.history.go('/login');
            return Promise.reject('Unauthorized.');
        }
    });
}

export const get = (url, body) => request('GET', url, body);
export const post = (url, body) => request('POST', url, body);
export const put = (url, body) => request('PUT', url, body);
export const del = (url, body) => request('DELETE', url, body);

export const convertGiga = (byte) => {
    const units = ['byte', 'KB', 'MB', 'GB', 'TB'];
    for (let i = 0; i < units.length; i++) {
        if (byte < 1024) {
            return {
                number: Math.round(byte * 100) / 100,
                unit: units[i],
            };
        }
        byte /= 1024;
    }
    return {
        number: Math.round(byte * 100) / 100,
        unit: units[units.length - 1],
    };
};

export const convertGigaFormat = (byte) => {
    const data = convertGiga(byte);
    return data.number + data.unit;
};
