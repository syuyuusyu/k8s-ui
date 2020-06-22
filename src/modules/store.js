import { observable, configure, action, runInAction, computed, toJS } from 'mobx';
import React, { Component } from 'react';
import { Tag, Popover, Badge, Tooltip, Alert, notification, message } from 'antd'
import { Link, } from 'react-router-dom';
import { EventSourcePolyfill } from 'event-source-polyfill';
import YAML from 'yaml';
import { nsUrl, host } from '../config/api'
import { get, put, del } from '../config/util'

configure({ enforceActions: 'observed' });
//    let json = YAML.parse(fs.readFileSync(path.resolve(__dirname, this.app.config.entityConfigYaml), 'utf8'));
Array.prototype.addk8s = function (o) {
    const { type, object: obj, } = o
    if (!this.idindex) {
        this.idindex = [];
    }
    if (type === 'DELETED') {
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

export class BaseStore {

    constructor(rootStore) {
        this.rootStore = rootStore;
    }

    get short() {
        return this.rootStore.shortName(this.kind)
    }

    @observable
    allList = []

    @computed
    get list() {
        return toJS(this.allList).filter(_ => _.metadata.namespace === this.rootStore.columnStore.currentNamespace)
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
                const { type, object: { kind, metadata: { name, namespace } }, notCache } = data

                if (notCache && (!namespace || namespace == this.currentNamespace)) {
                    let msg = `类型:${kind} ${namespace ? '命名空间:' + namespace : ' '} 名称:${name}`
                    let act = 'error'
                    switch (type) {
                        case 'ADDED':
                            msg = '新增资源 ' + msg
                            act = 'success'
                            break
                        case 'DELETED':
                            msg = '删除资源 ' + msg
                            act = 'error'
                            break
                        case 'MODIFIED':
                            msg = '资源 ' + msg + ' 状态发生改变'
                            act = 'warning'
                            break
                    }
                    message[act]({
                        content: msg,
                        style: {
                            marginTop: '45%',
                            marginLeft: '50%'
                        },
                    })

                }
                const { storeMap } = this.rootStore
                runInAction(() => {
                    for (let key in storeMap) {
                        if (data.object.kind === key) {
                            switch (key) {
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
                        return <Alert message={value.phase} type={'info'} showIcon />
                    }
                    let obj = value.conditions[0].message
                    return <Tooltip title={obj}><div ><Alert message={value.phase} type={'warning'} showIcon /></div></Tooltip>
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
                //<Tooltip title={obj}><div ><Alert message={value.phase} type={'warning'} showIcon /></div></Tooltip>

                return arr.map((item, index) => {
                    if (!item.reason) {
                        return <Alert key={index + ''} message={item.state} type={item.state == 'running' ? 'success' : 'error'} showIcon />
                    }
                    if (item.reason) {
                        if (item.message) {
                            return <Tooltip Alert key={index + ''} title={item.message}><div ><Alert message={`${item.state}(${item.reason})`} type={'error'} showIcon /></div></Tooltip>
                        }
                        return <Alert key={index + ''} message={`${item.state}(${item.reason})`} type={'error'} showIcon />
                    }
                })
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
            dataIndex: ['spec', 'ports'], title: 'Ports', width: 100,
            render: ports => ports.map((p, i) => p.port + '/' + p.protocol + `${i % 3 == 0 ? '\n' : ''}`).join(',')
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
                console.log(kind)
                console.log(sname)
                return <Tag color="success" > <Link to={`/k8s/${sname}/detail`} onClick={() => { this.rootStore.menuStore.goto(sname, name) }}>{name}</Link></Tag >
            }

        },
    ]
    limitsColumns = [
        this.column.name('limits'),
        this.column.creationTimestamp,
    ]
    quotaColumns = [
        this.column.name('quota'),
        {
            dataIndex: ['status', 'hard'], title: 'Hard', width: 200,
            render: (v) => `cpu: ${v.cpu}  memory: ${v.memory}  pods: ${v.pods}`
        },
        {
            dataIndex: ['status', 'used'], title: 'Used', width: 200,
            render: (v) => `cpu: ${v.cpu}  memory: ${v.memory}  pods: ${v.pods}`
        },
        this.column.creationTimestamp,
    ]

}

