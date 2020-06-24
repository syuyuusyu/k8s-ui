import { observable, configure, action, runInAction, computed, toJS, reaction } from 'mobx';
import { notification } from 'antd'
import YAML from 'yaml';

import { host } from '../../config/api';
import { get, put } from '../../config/util'


import { BaseStore, ControllerStore } from '../commonStore'

configure({ enforceActions: 'observed' });

export default class CrbStore extends BaseStore {
    kind = 'ClusterRoleBinding'
    @computed
    get list() {
        return toJS(this.allList)
    }
}