import { observable, configure, action, runInAction, computed, toJS } from 'mobx';
import React, { Component } from 'react';
import { Tag, Popover, Badge, Tooltip, Alert, } from 'antd'
import { Link, } from 'react-router-dom';
import { EventSourcePolyfill } from 'event-source-polyfill';
import { nsUrl, host } from '../config/api'
import { get } from '../config/util'

configure({ enforceActions: 'observed' });
//    let json = YAML.parse(fs.readFileSync(path.resolve(__dirname, this.app.config.entityConfigYaml), 'utf8'));
Array.prototype.addk8s = function (o) {
    const { type, object: obj, afterNow, beforeNow, deletionTimestamp } = o
    if (!this.idindex) {
        this.idindex = [];
    }
    if (type === 'DELETED' || deletionTimestamp) {
        if (this.idindex.includes(obj.metadata.uid)) {
            let index = this.idindex.indexOf(obj.metadata.uid)
            this.splice(index, 1);
            this.idindex.splice(index, 1);
        }
        return
    }

    if (this.idindex.includes(obj.metadata.uid)) {
        let index = this.idindex.indexOf(obj.metadata.uid)
        this.splice(index, 1);
        this.idindex.splice(index, 1);
    }
    this.idindex.push(obj.metadata.uid);
    this.push(obj)

}

Array.prototype.addpod = function (o) {
    const { type, object: obj, afterNow, beforeNow, deletionTimestamp } = o
    if (!this.idindex) {
        this.idindex = [];
    }

    if (deletionTimestamp) {
        console.log(`${obj.metadata.name} in terminating`)
        if (this.idindex.includes(obj.metadata.uid)) {
            let index = this.idindex.indexOf(obj.metadata.uid)
            this[index].metadata.terminating = true
            if (afterNow) {
                if (this[index].status.containerStatuses) {
                    for (let i = 0; i < this[index].status.containerStatuses.length; i++) {
                        this[index].status.containerStatuses[i].state = { "terminating...": {} }
                    }
                } else {
                    this[index].status.phase = 'terminating...'
                }
            }
            if (beforeNow) {
                this.splice(index, 1);
                this.idindex.splice(index, 1);
            }
        }
        return
    }

    if (this.idindex.includes(obj.metadata.uid)) {
        let index = this.idindex.indexOf(obj.metadata.uid)
        this.splice(index, 1);
        this.idindex.splice(index, 1);
    }
    this.idindex.push(obj.metadata.uid);
    this.push(obj)

}




export class ColumnStore {
    constructor(rootStore) {
        this.rootStore = rootStore;
        this.loadAll()
    }
    @observable
    currentNamespace = '';
    @observable
    allNamespace = []
    loadNs = async () => {
        let json = await get(nsUrl)
        runInAction(() => {
            this.allNamespace = json
            this.currentNamespace = json[0]
        })
    }
    @action
    nsChange = (value) => {
        this.currentNamespace = value
    }

    endpoints = []

    loadAll = () => {
        if (this.eventSource) {
            this.eventSource.close();
        }
        this.eventSource = new EventSourcePolyfill(`${host}/kube/watchAll`, {
            headers: {
                'access-token': sessionStorage.getItem('access-token') || ''
            }
        })
        this.eventSource.onmessage = result => {
            if (result && result.data) {
                const data = JSON.parse(result.data);

                if (data.type === 'HEARTBEAT') return
                if (data.type != 'ADDED') {
                    //console.log(data);
                }
                // if (data.object.kind === 'ReplicationController') {
                //     console.log(data);
                // }
                const { storeMap } = this.rootStore
                runInAction(() => {
                    for (let key in storeMap) {
                        if (data.object.kind === key) {
                            switch (key) {
                                case 'pod':
                                    this.rootStore.store('pod').allList.addpod(data)
                                    break
                                case 'Endpoints':
                                    this.endpoints.addk8s(data)
                                    break
                                default:
                                    this.rootStore.store(key).allList.addk8s(data)

                            }

                            //console.log(storeMap[key])
                            //console.log(this.rootStore.store(key))
                            //this.rootStore.store(key).allList.addk8s(data)
                        }
                    }
                })


            }
        };
        this.eventSource.onerror = err => {
            console.log('EventSource error: ', err);
            if (this.eventSource) {
                this.eventSource.close();
            }
        };
    }

    createLabels = (labelObj) => {
        labelObj = toJS(labelObj)
        let arr = []
        for (let key in labelObj) {
            arr.push(`${key}:${labelObj[key]}`)
        }
        if (arr.length <= 2) {
            return <div><Tag color="processing">{arr[0]}</Tag><Tag color="processing">{arr[1]}</Tag></div>
        } else {
            const content = (
                <div>
                    {
                        arr.map((l, i) => <div key={i}><Tag color="processing">{l}</Tag></div>)
                    }
                </div>
            );
            return <div>
                <Tag color="processing">{arr[0]}</Tag><Tag color="processing">{arr[1]}</Tag>
                <Popover content={content} >
                    <Badge count={arr.length} style={{ 'backgroundColor': '#e6f7ff' }} />
                </Popover>
            </div>
        }
    }
    createAnnotations(ann) {
        ann = toJS(ann)
        let arr = []
        for (let key in ann) {
            arr.push(`${key}:${ann[key]}`)
        }
        return (
            <div>
                {
                    arr.map((l, i) => <div key={i}><Tag color="processing">{l}</Tag></div>)
                }
            </div>
        )
    }
    _calculateAge = (value) => {
        let interval = new Date() - new Date(value)
        let day = Math.floor(interval / 24 / 60 / 60 / 1000)
        let hour = Math.floor(interval / 60 / 60 / 1000 % 24)
        let min = Math.floor(interval / 60 / 1000 % 60)
        if (day < 1) {
            return hour + '小时 ' + min + '分'
        }
        return day + '天 ' + hour + '小时';
    }



    //node ----------
    column = {
        name: (kind) => {
            return {
                dataIndex: ['metadata', 'name'], title: '名称', width: 200,
                render: (name) => <Tag color="success"><Link to={`/k8s/${kind}/detail`} onClick={() => { this.rootStore.menuStore.goto(kind, name) }}>{name}</Link></Tag>
            }
        },
        labels: {
            dataIndex: ['metadata', 'labels'], title: '标签', width: 300, render: this.createLabels
        },
        creationTimestamp: { dataIndex: ['metadata', 'creationTimestamp'], title: '运行时间', width: 100, render: this._calculateAge },
    }


    nodeColumns = [
        this.column.name('no'),
        this.column.labels,
        {
            dataIndex: ['status', 'conditions'], title: '状态', width: 100,
            render: (value) => value.find(_ => _.type === 'Ready').status === 'True' ? 'Ready' : 'NotReady'
        },
        {
            dataIndex: ['metadata', 'labels'], title: '角色', width: 100,
            render: (value) => toJS(value)['node-role.kubernetes.io/master'] === '' ? 'Master' : '<none>'
        },
        this.column.creationTimestamp,
        { dataIndex: ['status', 'nodeInfo', 'kubeletVersion'], title: '版本', width: 100 }
    ]
    //Name Labels Ready Phase  Restarts  Node Age
    podColumns = [
        this.column.name('pod'),
        this.column.labels,
        {
            dataIndex: ['status', 'containerStatuses'], title: '就绪', width: 100,
            render: (value) => {
                if (!value) {
                    return '0/0';
                }
                let containers = value.length
                let runing = value.filter(_ => _.state.running).length
                return `${runing}/${containers}`;
            }
        },
        {
            dataIndex: 'status',
            title: '状态',
            className: 'podStatus',
            width: 200,
            render: (value) => {
                if (!value.containerStatuses) {
                    if (!value.conditions) {
                        return '-';
                    }
                    let obj = value.conditions[0].message
                    return <Tooltip title={obj}><div ><Alert message={value.phase} type={'error'} showIcon /></div></Tooltip>
                }
                let arr = value.containerStatuses.map(_ => {
                    let map = {
                        name: _.name
                    }
                    for (let key in _.state) {
                        map.state = key;
                        let obj = _.state[key];
                        map.message = obj.message;
                        map.reason = obj.reason;
                    }
                    return map;
                });
                if (arr.length === 1) {
                    return arr.map((item, index) => {
                        return (
                            item.reason ?
                                <Popover key={index} title={item.name} content={<div style={{ width: 200 }}>{item.message}</div>}>
                                    <div>
                                        <Alert message={item.reason ? `${item.state}(${item.reason})` : item.state} type={item.state === 'running' ? 'success' : 'error'} showIcon />
                                    </div>
                                </Popover>
                                :
                                <div key={index}>
                                    <Alert message={item.reason ? `${item.state}(${item.reason})` : item.state} type={item.state === 'running' ? 'success' : 'error'} showIcon />
                                </div>
                        );
                    })
                        ;
                } else if (arr.length !== 0) {
                    return arr.map((item, index) => {
                        const message = item.reason ? `${item.name}：${item.state}(${item.reason})` : `${item.name}：${item.state}`;
                        return (
                            item.reason ?
                                <Popover key={index} title={item.name} content={<div style={{ width: 200 }}>{item.message}</div>}>
                                    <div style={{ marginBottom: '15px' }}>
                                        <Alert message={message} type={item.state === 'running' ? 'success' : 'error'} showIcon />
                                    </div>
                                </Popover>
                                :
                                <div key={index} style={{ marginBottom: '15px' }}>
                                    <Alert message={message} type={item.state === 'running' ? 'success' : 'error'} showIcon />
                                </div>
                        );
                    })
                }
            }
        },
        { dataIndex: ['spec', 'nodeName'], title: '所在节点', width: 120 },
        this.column.creationTimestamp,
    ]

    deployColumns = [
        this.column.name('deploy'),
        this.column.labels,
        {
            dataIndex: 'status', title: 'status', width: 100,
            render: (value) => `${value.readyReplicas}/${value.availableReplicas}`
        },
        this.column.creationTimestamp,
        {
            dataIndex: ['spec', 'template', 'spec', 'containers'], title: 'containers', width: 100,
            render: (value) => {
                return value.map(c => c.name).join(',')
            }
        }
    ]
    rsColumns = [
        this.column.name('rs'),
        this.column.labels,
        {
            dataIndex: 'status', title: 'status', width: 100,
            render: (value) => `${value.readyReplicas}/${value.availableReplicas}`
        },
        this.column.creationTimestamp,
        {
            dataIndex: ['spec', 'template', 'spec', 'containers'], title: 'containers', width: 100,
            render: (value) => {
                return value.map(c => c.name).join(',')
            }
        }
    ]
    //Desired Current Ready Up-To-Date Age Node Selector
    dsColumns = [
        this.column.name('ds'),
        this.column.labels,
        {
            dataIndex: ['status', 'desiredNumberScheduled'], title: 'Desired', width: 100,
        },
        {
            dataIndex: ['status', 'currentNumberScheduled'], title: 'Current', width: 100,
        },
        {
            dataIndex: ['status', 'numberReady'], title: 'Ready', width: 100,
        },
        {
            dataIndex: ['status', 'updatedNumberScheduled'], title: 'Up-To-Date', width: 100,
        },
        this.column.creationTimestamp,
    ]

    stsColumns = [
        this.column.name('sts'),
        this.column.labels,
        {
            dataIndex: ['status', 'replicas'], title: 'Replicas', width: 100,
        },
        {
            dataIndex: ['status', 'readyReplicas'], title: 'Ready', width: 100,
        },
        this.column.creationTimestamp,
    ]
    rcColumns = [
        this.column.name('rc'),
        this.column.labels,
        {
            dataIndex: 'status', title: 'status', width: 100,
            render: (value) => `${value.readyReplicas}/${value.availableReplicas}`
        },
        this.column.creationTimestamp,
        {
            dataIndex: ['spec', 'template', 'spec', 'containers'], title: 'containers', width: 100,
            render: (value) => {
                return value.map(c => c.name).join(',')
            }
        }
    ]

    jobColumns = [
        this.column.name('job'),
        this.column.labels,
        {
            dataIndex: ['status', 'conditions'], title: 'Completions', width: 100,
            render: (value) => value && value.length ? value.length : 0
        },
        {
            dataIndex: ['status', 'succeeded'], title: 'Successful', width: 100,
        },
        this.column.creationTimestamp,
    ]

    cjColumns = [
        this.column.name('cj'),
        this.column.labels,
        {
            dataIndex: ['spec', 'schedule'], title: 'Schedule', width: 200,
        },
        this.column.creationTimestamp,
    ]

    cmColumns = [
        this.column.name('cm'),
        this.column.labels,
        {
            dataIndex: 'data', title: 'data', width: 100,
            render: (value) => {
                if (!value) {
                    return 0
                }
                return Object.keys(value).length
            }
        },
        this.column.creationTimestamp,
    ]
    //Name Status Volume Capacity Access Modes Storage Class Age
    pvcColumns = [
        this.column.name('pvc'),
        {
            dataIndex: ['status', 'phase'], title: 'Status', width: 100,
        },
        //TODO Volume
        {
            dataIndex: ['spec', 'volumeName'], title: 'Volume', width: 200,
            render: name =>
                <Tag color="success"><Link to={`/k8s/pv/detail`} onClick={() => { this.rootStore.menuStore.goto('pv', name) }}>{name}</Link></Tag>

        },
        {
            dataIndex: ['status', 'capacity', 'storage'], title: 'Capacity', width: 100,
        },
        {
            dataIndex: ['status', 'accessModes'], title: 'Access Modes', width: 200,
            render: (v) => v.join(',')
        },
        {
            dataIndex: ['spec', 'storageClassName',], title: 'Storage Class', width: 150,
        },
        this.column.creationTimestamp,
    ]

    //Capacity  Access Modes Reclaim Policy  Status    Claim   Storage Class   Reason  Age
    pvColumns = [
        this.column.name('pv'),
        {
            dataIndex: ['spec', 'capacity', 'storage'], title: 'Capacity', width: 100,
        },
        {
            dataIndex: ['spec', 'accessModes'], title: 'Access Modes', width: 200,
            render: (v) => v.join(',')
        },
        {
            dataIndex: ['spec', 'persistentVolumeReclaimPolicy',], title: 'Reclaim Policy', width: 100,
        },
        {
            dataIndex: ['status', 'phase'], title: 'Status', width: 100,
        },
        {
            dataIndex: ['spec', 'claimRef'], title: 'Claim', width: 100,
            render: (v) => {
                if (!v) {
                    return ''
                }
                const { name, namespace } = v
                return <Tag color="success"><Link to={`/k8s/pvc/detail`} onClick={() => { this.rootStore.menuStore.goto('pvc', name, namespace) }}>{name}</Link></Tag>
            }

        },
        {
            dataIndex: ['spec', 'storageClassName'], title: 'Storage Class', width: 100,
        },
        this.column.creationTimestamp,
    ]

    secretColumns = [
        this.column.name('secret'),
        this.column.labels,
        {
            dataIndex: 'type', title: 'Type', width: 100,
        },
        {
            dataIndex: 'data', title: 'Data', width: 100, render: v => v ? v.length : 0
        },
        this.column.creationTimestamp,
    ]

    saColumns = [
        this.column.name('sa'),
        this.column.labels,
        {
            dataIndex: 'secrets', title: 'Secrets', width: 100, render: v => v ? v.length : 0
        },
        this.column.creationTimestamp,
    ]
    //Type Cluster IP External IP Ports externalIPs
    svcColumns = [
        this.column.name('svc'),
        this.column.labels,
        {
            dataIndex: ['spec', 'type'], title: 'Type', width: 100,
        },
        {
            dataIndex: ['spec', 'clusterIP'], title: 'Type', width: 100,
        },
        {
            dataIndex: ['spec', 'externalIPs'], title: 'External IP', width: 200, //TODO array
        },
        {
            dataIndex: ['spec', 'ports'], title: 'Ports', width: 200,
            render: ports => ports.map(p => p.port + '/' + p.protocol).join(',')
        },
        this.column.creationTimestamp,
    ]

    ingColumns = [
        this.column.name('ing'),
        this.column.labels,
        this.column.creationTimestamp,
    ]
    //Targets Minimum Pods Maximum Pods Replicas
    hpaColumns = [
        this.column.name('hpa'),
        this.column.labels,
        //TODO Targets
        {
            dataIndex: ['spec', 'maxReplicas'], title: 'Minimum Pods', width: 100,
        },
        {
            dataIndex: ['spec', 'minReplicas'], title: 'Maximum Pods', width: 100,
        },
        {
            dataIndex: ['status', 'currentReplicas'], title: 'Replicas', width: 100,
        },
        this.column.creationTimestamp,
    ]
    //Kind Message Reason Type First Seen  Last Seen
    eventColumns = [
        {
            dataIndex: 'involvedObject', title: 'Kind', width: 150,
            render: (v) => {
                const name = v.name
                if (this.rootStore.storeMap[v.kind]) {
                    const kind = v.kind
                    const sname = this.rootStore.shortName(kind)
                    console.log(sname)
                    const ns = v.namespace
                    return <Tag color="success"><Link to={`/k8s/${sname}/detail`} onClick={() => { this.rootStore.menuStore.goto(sname, name, ns) }}>{name}</Link></Tag>
                }
                return name
            }
        },
        {
            dataIndex: 'message', title: 'Message', width: 200,
            render: (v, r) =>
                <Tag color="success" > <Link to={`/k8s/event/detail`} onClick={() => { this.rootStore.menuStore.goto('event', r.metadata.name) }}>{v}</Link></Tag >

        },
        {
            dataIndex: 'type', title: 'Type', width: 100,
        },
        { dataIndex: 'firstTimestamp', title: 'First Seen', width: 100, render: this._calculateAge },
        { dataIndex: 'lastTimestamp', title: 'Last Seen', width: 100, render: this._calculateAge },
    ]

    rColumns = [
        this.column.name('r'),
        this.column.creationTimestamp,
    ]
    rbColumns = [
        this.column.name('rb'),
        this.column.creationTimestamp,
        {
            dataIndex: ['roleRef', 'kind'], title: 'Role Kind', width: 100,
        },
        {
            dataIndex: 'roleRef', title: 'Role Name', width: 150,
            render: (v) => {
                const { kind, name } = v
                const sname = this.rootStore.shortName(kind)
                return <Tag color="success" > <Link to={`/k8s/${sname}/detail`} onClick={() => { this.rootStore.menuStore.goto(sname, name) }}>{name}</Link></Tag >
            }

        },
    ]
    crColumns = [
        this.column.name('cr'),
        this.column.creationTimestamp,
    ]
    crbColumns = [
        this.column.name('crb'),
        this.column.labels,
        this.column.creationTimestamp,
        {
            dataIndex: ['roleRef', 'kind'], title: 'Role Kind', width: 100,
        },
        {
            dataIndex: 'roleRef', title: 'Role Name', width: 150,
            render: (v) => {
                const { kind, name } = v
                const sname = this.rootStore.shortName(kind)
                return <Tag color="success" > <Link to={`/k8s/${sname}/detail`} onClick={() => { this.rootStore.menuStore.goto(sname, name) }}>{name}</Link></Tag >
            }

        },
    ]

}

