import { observable, configure, action, runInAction, computed, toJS } from 'mobx';
import YAML from 'yaml';

import { host } from '../../config/api';
import { get } from '../../config/util'



configure({ enforceActions: 'observed' });

export default class NodeStore {
    constructor(rootStore) {
        this.rootStore = rootStore;
    }

    @observable
    allList = []

    @computed
    get list() {
        return toJS(this.allList)
    }

    @observable
    currentName = ''
    @action
    setCurrentName = (name) => {
        this.currentName = name
    }

    @computed
    get currentElement() {
        return toJS(this.list).find(_ => _.metadata.name === toJS(this.currentName))
    }

    @computed
    get yamlText() {
        return YAML.stringify(this.currentElement);
    }




}

