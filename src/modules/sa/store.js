import { observable, configure, action, runInAction, computed, toJS, reaction } from 'mobx';
import { notification } from 'antd'
import YAML from 'yaml';

import { host } from '../../config/api';
import { get, put, del } from '../../config/util'



configure({ enforceActions: 'observed' });

export default class SaStore {
    constructor(rootStore) {
        this.rootStore = rootStore;

    }

    @observable
    allList = []

    @computed
    get list() {
        return toJS(this.allList).filter(_ => _.metadata.namespace === this.rootStore.columnStore.currentNamespace)
    }

    @observable
    currentName
    @action
    setCurrentName = (name) => {
        this.currentName = name
    }

    @computed
    get currentElement() {

        const e = toJS(this.list).find(_ => _.metadata.name === this.currentName)
        if (!e) {
            this.rootStore.history.push('/k8s/sa');
            //this.rootStore.history.back()
            return
        }
        console.log(`currentName:${this.currentName}  e.name:${e.metadata.name}  e.terminating:${e.metadata.terminating}`)
        if (e.metadata.terminating) {
            notification.info({
                message: `${this.currentName}处于删除状态`
            });
            this.rootStore.history.push('/k8s/sa');
            //this.rootStore.history.back()
        }
        return e
    }

    @computed
    get yamlText() {
        return YAML.stringify(this.currentElement);
    }

    yamlCurrent = ''
    yamlJson = {}

    valideCode = () => {
        try {
            this.yamlJson = YAML.parse(this.yamlCurrent);
            return true;
        } catch (e) {
            notification.error({
                message: e.toLocaleString()
            });
            return false;
        }
    };

    update = async () => {
        if (!this.valideCode()) return
        delete this.yamlJson.status
        delete this.yamlJson.metadata.creationTimestamp
        let json = await put(`${host}/kube/ServiceAccount`, this.yamlJson);
        notification[json.success ? 'info' : 'error']({
            message: json.msg
        })
    }

    delete = async () => {
        let json = await del(`${host}/kube/namespace/${this.rootStore.columnStore.currentNamespace}/ServiceAccount/${this.currentName}`);
        if (json.success) {
            notification.info({
                message: json.msg
            });
            this.rootStore.history.push('/k8s/sa')
        } else {
            notification.error({
                message: json.msg,
                style: {
                    width: 600,
                    marginLeft: 335 - 600,
                },
            });
        }
    }
}





