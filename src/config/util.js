import axios from 'axios';

String.prototype.toUpperFirstCase = function () {
    let first = this.trimLeft().split('')[0]
    return this.replace(/^\s*(\w)/, () => first.toLocaleUpperCase())
}

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
            'access_token': sessionStorage.getItem('access_token') || '',// 从sessionStorage中获取access token
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
            const token = res.headers['access_token'];
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

const { toString } = Object.prototype;
export const isFunction = function (v) {
    return toString.call(v) == '[object Function]';
};

export const isObj = function (v) {
    return toString.call(v) == '[object Object]';
};

export const isArrsy = function (v) {
    return toString.call(v) == '[object Array]';
};

export const isString = function (v) {
    return toString.call(v) == '[object String]';
};

export const isNumber = function (v) {
    return toString.call(v) == '[object Number]'
}

export const isBool = function (v) {
    return toString.call(v) == '[object Boolean]'
}

export const convertGiga = (byte) => {
    if (isString(byte)) {
        byte = byte.replace(/(\d+)(\w)\w/, (w, p, u) => {
            switch (u.toUpperCase()) {
                case 'K':
                    return Number.parseFloat(p) * 1024
                case 'M':
                    return Number.parseFloat(p) * 1024 * 1024
                case 'G':
                    return Number.parseFloat(p) * 1024 * 1024 * 1024
                default:
                    return p
            }
        })
        byte = Number.parseInt(byte)
    }
    let raw = byte
    const units = ['byte', 'KB', 'MB', 'GB', 'TB'];
    for (let i = 0; i < units.length; i++) {
        if (byte < 1024) {
            return {
                number: Math.round(byte * 100) / 100,
                unit: units[i],
                raw
            };
        }
        byte /= 1024;
    }
    return {
        number: Math.round(byte * 100) / 100,
        unit: units[units.length - 1],
        raw
    };
};

export const convertGigaFormat = (byte) => {
    const data = convertGiga(byte);
    return data.number + data.unit;
};

export const transQuota = (value, unit = '') => {
    let m = {
        'Ki': Math.pow(2, 10),
        'Mi': Math.pow(2, 20),
        'Gi': Math.pow(2, 30),
        'Ti': Math.pow(2, 40),
        'Pi': Math.pow(2, 50),
        'Ei': Math.pow(2, 60),
        'n': Math.pow(10, -9),
        'u': Math.pow(10, -6),
        'm': Math.pow(10, -3),
        'K': Math.pow(10, 3),
        'M': Math.pow(10, 6),
        'G': Math.pow(10, 9),
        'T': Math.pow(10, 12),
        'P': Math.pow(10, 15),
        'E': Math.pow(10, 18)
    };
    for (let p in m) {
        if (value.indexOf(p) !== -1) {
            value = parseFloat(value) * m[p];
            break;
        }
    }
    if (m[unit]) {
        value = value / m[unit];
        return value.toFixed(2) + unit;
    }
    return value
};

