import { observable, configure, action, runInAction, computed, toJS, reaction } from 'mobx';
import { notification } from 'antd'
import YAML from 'yaml';

import { host } from '../../config/api';
import { get, put, del } from '../../config/util'

import { BaseStore, ControllerStore } from '../commonStore'

configure({ enforceActions: 'observed' });

export default class CmStore extends BaseStore {
    kind = 'ConfigMap'

    @computed
    get dataNamelist() {
        if (!this.currentElement.data) {
            return []
        }
        return Object.keys(this.currentElement.data)
    }

    @observable
    dataName = ''


    @computed
    get currentData() {
        return this.currentElement.data[this.dataName]
    }

    @action
    setDataName = (v) => this.dataName = v
}







