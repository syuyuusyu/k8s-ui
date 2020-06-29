import { observable, configure, action, runInAction, computed, toJS, reaction } from 'mobx';
import YAML from 'yaml';
import { EventSourcePolyfill } from 'event-source-polyfill';
import { notification } from 'antd'
import { createBrowserHistory } from 'history';

import { host } from '../../config/api';
import { get, put, del, convertGigaFormat, convertGiga } from '../../config/util'
import { BaseStore, ControllerStore } from '../commonStore'

configure({ enforceActions: 'observed' });

export default class PodStore extends BaseStore {
    kind = 'Pod'

    @observable
    metricsList = []

    @computed
    get liquidConfig() {
        let { metadata: { name: pname, namespace }, spec: { containers: podContainers } } = this.currentElement
        const metric = toJS(this.metricsList).find(m => m.metadata.name === pname && m.metadata.namespace === namespace)
        if (!metric) {
            return []
        }
        let { containers: metricContainers } = metric
        const quota = this.rootStore.list('quota').find(_ => true)
        if (!quota) {
            return metricContainers.map(({ name, usage: { memory, cpu } }) => {
                return { name, cpu, memory: convertGigaFormat(memory) }
            })
        }

        return podContainers.map(({ name, resources: { limits: { memory: limitMemory, cpu: limitCpu } } }) => {
            let { usage: { memory, cpu } } = metricContainers.find(m => m.name === name)
            limitCpu = Number.parseInt(limitCpu) * 1000
            cpu = Number.parseInt(cpu)
            limitMemory = convertGiga(limitMemory).number
            memory = convertGiga(memory).number
            return {
                name,
                config: [
                    {
                        title: {
                            alignTo: 'middle',
                            visible: true,
                            text: 'CPU使用率',
                        },
                        description: {
                            visible: true,
                            alignTo: 'middle',
                            text: `共${limitCpu}m已使用${cpu}m`,
                        },
                        min: 0,
                        max: limitCpu,
                        value: cpu,
                        statistic: { formatter: (value) => ((100 * value) / limitCpu).toFixed(1) + '%' },
                    },
                    {
                        title: {
                            alignTo: 'middle',
                            visible: true,
                            text: '内存使用率',
                        },
                        description: {
                            visible: true,
                            alignTo: 'middle',
                            text: `共${convertGigaFormat(limitMemory)}已使用${convertGigaFormat(memory)}`,
                        },
                        min: 0,
                        max: limitMemory,
                        value: memory,
                        statistic: { formatter: (value) => ((100 * value) / limitMemory).toFixed(1) + '%' },
                    },
                ]
            }
        })
    }

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
                    arr.push({ name: v.name, kind: v.kind, refName: v.refName, mountPath: vm.mountPath, subPath: vm.subPath, containerName: container.name })
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
