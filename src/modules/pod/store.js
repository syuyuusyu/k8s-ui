import { observable, configure, action, runInAction, computed, toJS, reaction } from 'mobx';
import YAML from 'yaml';
import { EventSourcePolyfill } from 'event-source-polyfill';
import { notification } from 'antd'
import { createBrowserHistory } from 'history';

import { host } from '../../config/api';
import { get, put, del } from '../../config/util'
import { BaseStore } from '../store'



configure({ enforceActions: 'observed' });

export default class PodStore extends BaseStore {
    kind = 'Pod'

    @computed
    get volumeList() {
        const volumes = this.currentElement.spec.volumes
        let arr = []
        volumes.forEach(v => {
            let kind = Object.keys(v).find(k => k !== 'name')
            let description = v[kind]
            kind = kind.toUpperFirstCase()
            const refNamekey = Object.keys(description).find(k => {
                return k.endsWith("name") || k.endsWith("Name")
            })
            const refName = description[refNamekey]
            arr.push({ name: v.name, kind, description: JSON.stringify(description), refName })
        });
        return arr
    }

    @computed
    get volumeMountList() {
        let arr = []
        this.currentElement.spec.containers.forEach(container => {
            if (container.volumeMounts) {
                container.volumeMounts.forEach(vm => {
                    const v = this.volumeList.find(v => v.name === vm.name)
                    arr.push({ name: v.name, kind: v.kind, refName: v.refName, mountPath: vm.mountPath, containerName: container.name })
                })
            }
        })
        return arr
    }

    @computed
    get envList() {
        let arr = []
        this.currentElement.spec.containers.forEach(container => {
            if (container.env) {
                container.env.forEach(env => {
                    if (env.valueFrom) {
                        if (env.valueFrom.configMapKeyRef) {
                            const { name, key } = env.valueFrom.configMapKeyRef
                            const obj = this.rootStore.list('cm').find(c => c.metadata.name === name)
                            arr.push({ containerName: container.name, name: env.name, value: obj.data[key], kind: 'ConfigMap', refName: name })
                        }
                        if (env.valueFrom.secretKeyRef) {
                            const { name, key } = env.valueFrom.secretKeyRef
                            const obj = this.rootStore.list('secret').find(c => c.metadata.name === name)
                            arr.push({ containerName: container.name, name: env.name, value: obj.data[key], kind: 'Secret', refName: name })
                        }
                        if (env.valueFrom.fieldRef) {
                            const { fieldPath } = env.valueFrom.fieldRef
                            let ar = fieldPath.split('.')
                            let obj = this.currentElement
                            for (let i = 0; i < ar.length; i++) {
                                let key = ar[i]
                                obj = obj[key]
                            }
                            arr.push({ containerName: container.name, name: env.name, value: obj, kind: 'ObjectField' })
                        }
                    } else {
                        arr.push({ containerName: container.name, name: env.name, value: env.value })
                    }
                })
            }
        })
        return arr
    }

}
