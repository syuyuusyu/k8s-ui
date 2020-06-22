import { observable, configure, action, runInAction, computed, toJS, reaction } from 'mobx';
import { notification } from 'antd'
import YAML from 'yaml';

import { host } from '../../config/api';
import { get, put } from '../../config/util'


import { BaseStore } from '../store'

configure({ enforceActions: 'observed' });

export default class QuotaStore extends BaseStore {
    kind = 'ResourceQuota'
}







