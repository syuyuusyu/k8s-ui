// @ts-nocheck
import { observable, configure, action, runInAction, computed, toJS } from 'mobx';
import React, { Component } from 'react';
import { Tag, Popover, Badge, Tooltip, Alert, notification, message } from 'antd'
import { Link, } from 'react-router-dom';
import { EventSourcePolyfill } from 'event-source-polyfill';
import YAML from 'yaml';
import { nsUrl, host } from '../config/api'
import { get, put, del } from '../config/util'

configure({ enforceActions: 'observed' });

export class BaseStore {

    constructor(rootStore) {
        this.rootStore = rootStore;
    }

    get short() {
        return this.rootStore.shortName(this.kind)
    }

    @observable
    allList = []

    @observable
    createVisible = false

    @action
    toggleVisible = () => this.createVisible = !this.createVisible

    @computed
    get list() {
        return toJS(this.allList).filter(_ => _.metadata.namespace === this.rootStore.columnStore.currentNamespace)
    }

    @computed
    get nameList() {
        return this.list.map(_ => _.metadata.name)
    }

    @observable
    currentName = ''
    @action
    setCurrentName = (name) => {
        this.currentName = name
    }

    @computed
    get currentElement() {

        const e = toJS(this.list).find(_ => _.metadata.name === this.currentName)
        if (!e) {
            this.rootStore.history.push(`/k8s/${this.short}`)
            return
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
        delete this.yamlJson.metadata.managedFields
        console.log(this.yamlJson)
        let json = await put(`${host}/kube/${this.kind}`, this.yamlJson);
        notification[json.success ? 'info' : 'error']({
            message: json.msg
        })
    }

    delete = async () => {
        let json = await del(`${host}/kube/namespace/${this.rootStore.columnStore.currentNamespace}/${this.kind}/${this.currentName}`);
        if (json.success) {
            notification.info({
                message: json.msg
            });
            this.rootStore.history.push(`/k8s/${this.short}`)
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

    //PodTemplate 

}

export class ControllerStore extends BaseStore {

    @computed
    get volumeList() {
        if (!this.currentElement.spec.template || !this.currentElement.spec.template.spec.volumes) {
            return []
        }
        const volumes = this.currentElement.spec.template.spec.volumes

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
        if (!this.currentElement.spec.template) {
            return []
        }
        let arr = []
        this.currentElement.spec.template.spec.containers.forEach(container => {
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
        if (!this.currentElement.spec.template) {
            return []
        }
        let arr = []
        this.currentElement.spec.template.spec.containers.forEach(container => {
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