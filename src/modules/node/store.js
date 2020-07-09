import { observable, configure, action, runInAction, computed, toJS, reaction } from 'mobx';
import { notification } from 'antd'
import YAML from 'yaml';

import { host } from '../../config/api';
import { get, put, convertGigaFormat } from '../../config/util'


import { BaseStore, ControllerStore } from '../commonStore'


configure({ enforceActions: 'observed' });


export default class NodeStore extends BaseStore {


    kind = 'Node'

    @computed
    get list() {
        return toJS(this.allList)
    }

    @observable
    metricsList = []

    @computed
    get liquidConfig() {
        let { metadata: { name }, status: { capacity: { memory: allMemory, cpu: allCpu, pods: allPods } } } = this.currentElement

        const podNum = this.rootStore.store('Pod').allList.filter(p => p.spec.nodeName === name).length
        const metric = this.metricsList.find(m => m.metadata.name === name)
        if (!metric || !metric.usage) {
            return []
        }

        let { usage: { cpu, memory } } = metric

        allCpu = Number.parseInt(allCpu) * 1000
        cpu = Number.parseInt(cpu)
        const cpuConfig = {
            title: {
                alignTo: 'middle',
                visible: true,
                text: 'CPU使用率',
            },
            description: {
                visible: true,
                alignTo: 'middle',
                text: `共${allCpu}m已使用${cpu}m`,
            },
            min: 0,
            max: allCpu,
            value: cpu,
            statistic: { formatter: (value) => ((100 * value) / allCpu).toFixed(1) + '%' },
        }

        allPods = Number.parseInt(allPods)
        const podConfig = {
            title: {
                visible: true,
                alignTo: 'middle',
                text: 'POD使用率',
            },
            description: {
                visible: true,
                alignTo: 'middle',
                text: `共${allPods}已使用${podNum}`,
            },
            min: 0,
            max: allPods,
            value: podNum,
            statistic: { formatter: (value) => ((100 * value) / allPods).toFixed(1) + '%' },
        }

        allMemory = Number.parseFloat(allMemory.replace(/(\d+)\w+/, (w, p) => p)) * 1024
        memory = Number.parseFloat(memory.replace(/(\d+)\w+/, (w, p) => p)) * 1024
        const memoryConfig = {
            title: {
                visible: true,
                alignTo: 'middle',
                text: '内存使用率',
            },
            description: {
                visible: true,
                alignTo: 'middle',
                text: `共${convertGigaFormat(allMemory)}已使用${convertGigaFormat(memory)}`,
            },
            min: 0,
            max: allMemory,
            value: memory,
            statistic: { formatter: (value) => ((100 * value) / allMemory).toFixed(1) + '%' },
        }
        return [cpuConfig, memoryConfig, podConfig]

    }

}


