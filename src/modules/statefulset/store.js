import { observable, configure, action, runInAction, computed, toJS, reaction } from 'mobx';
import { notification } from 'antd'
import YAML from 'yaml';

import { host } from '../../config/api';
import { get, put } from '../../config/util'


import { ControllerStore } from '../commonStore'

configure({ enforceActions: 'observed' });

export default class StsStore extends ControllerStore {
    kind = 'StatefulSet'

    @computed
    get volumeMountList() {
        if (!this.currentElement.spec.template) {
            return []
        }
        let arr = []
        this.currentElement.spec.template.spec.containers.forEach(container => {
            if (container.volumeMounts) {
                container.volumeMounts.forEach(vm => {
                    if (this.volumeList) {
                        const v = this.volumeList.find(v => v.name === vm.name)
                        if (v) {
                            arr.push({ name: v.name, kind: v.kind, refName: v.refName, mountPath: vm.mountPath, subPath: vm.subPath, containerName: container.name })
                        }
                    }
                    if (this.currentElement.spec.volumeClaimTemplates) {
                        const vc = this.currentElement.spec.volumeClaimTemplates.find(v => v.metadata.name === vm.name)
                        arr.push({ name: vm.name, kind: 'PersistentVolumeClaim', mountPath: vm.mountPath, containerName: container.name })
                    }
                })
            }
        })
        return arr
    }
}







