import React, { Component } from 'react';
import {
    Modal, Badge, Icon, Input, Table, Dropdown, Menu, Button, Divider, Popconfirm, Descriptions, Tabs, Row, Col, Tag
} from 'antd';
import { Link } from 'react-router-dom';
const { TabPane } = Tabs;
import { inject, observer } from 'mobx-react';
import TerminalConsole from './terminal'
import LogConsole from './logConsole'
import { toJS } from 'mobx';
import { Conditions, Metadata } from '../common'
import { convertGigaFormat } from '../../config/util'

import { UnControlled as CodeMirror } from 'react-codemirror2'
import 'codemirror/mode/yaml/yaml';
import 'codemirror/mode/javascript/javascript';
import 'codemirror/addon/hint/show-hint.css';
import 'codemirror/addon/hint/show-hint.js';

import 'codemirror/lib/codemirror.css';
import 'codemirror/theme/material.css';
import 'codemirror/theme/ambiance.css';
import 'codemirror/theme/idea.css';
import '../codeMirrorStyle.css';


@inject('rootStore')
@observer
class PodInfo extends Component {

    render() {
        const store = this.props.rootStore.podStore
        const pod = store.currentElement
        const rsStore = this.props.rootStore.rsStore
        const rss = rsStore.list.filter(_ => pod.metadata.ownerReferences.find(ow => ow.uid === _.metadata.uid))
        const sts = this.props.rootStore.list('sts').filter(_ => pod.metadata.ownerReferences.find(ow => ow.uid === _.metadata.uid))
        const ds = this.props.rootStore.list('ds').filter(_ => pod.metadata.ownerReferences.find(ow => ow.uid === _.metadata.uid))
        console.log(pod.status.containerStatuses);
        return (
            <div>
                <Descriptions title={`Info`} size={'small'} bordered>
                    {
                        rss.map(d =>
                            <Descriptions.Item span={3} key={Math.random().toString().substr(2, 10)} label="Controlled By">
                                <Tag color="success"><Link to={`/k8s/rs/detail`} onClick={() => { this.props.rootStore.menuStore.goto('rs', d.metadata.name) }}>{d.metadata.name}</Link></Tag>
                            </Descriptions.Item>)
                    }
                    {
                        sts.map(d =>
                            <Descriptions.Item span={3} key={Math.random().toString().substr(2, 10)} label="Controlled By">
                                <Tag color="success"><Link to={`/k8s/sts/detail`} onClick={() => { this.props.rootStore.menuStore.goto('sts', d.metadata.name) }}>{d.metadata.name}</Link></Tag>
                            </Descriptions.Item>)
                    }
                    {
                        ds.map(d =>
                            <Descriptions.Item span={3} key={Math.random().toString().substr(2, 10)} label="Controlled By">
                                <Tag color="success"><Link to={`/k8s/ds/detail`} onClick={() => { this.props.rootStore.menuStore.goto('ds', d.metadata.name) }}>{d.metadata.name}</Link></Tag>
                            </Descriptions.Item>)
                    }
                    <Descriptions.Item label="Priority">{pod.spec.priority}</Descriptions.Item>
                    <Descriptions.Item label="Node">{pod.spec.nodeName}</Descriptions.Item>
                    <Descriptions.Item label="Service Account">{pod.spec.serviceAccount}</Descriptions.Item>
                    <Descriptions.Item label="QoS">{pod.status.qosClass}</Descriptions.Item>
                    <Descriptions.Item label="Phase">{pod.status.phase}</Descriptions.Item>
                    <Descriptions.Item label="Pod IP">{pod.status.podIP}</Descriptions.Item>
                    <Descriptions.Item label="Host IP">{pod.status.hostIP}</Descriptions.Item>
                </Descriptions>
                {

                    pod.status.containerStatuses.map(c => {
                        let cspec = pod.spec.containers.find(_ => _.name === c.name)
                        let stateKey = Object.keys(c.state)[0]
                        return (
                            <Descriptions key={Math.random().toString().substr(2, 10)} title={`Container ${c.name}`} size={'small'} bordered>
                                <Descriptions.Item label="Image" span={3}>{c.image}</Descriptions.Item>
                                <Descriptions.Item label="Image ID" span={3}>{c.imageID}</Descriptions.Item>
                                {
                                    cspec.ports ? <Descriptions.Item label="Container Ports" span={3}>{cspec.ports.map(_ => _.containerPort + '/' + _.protocol + ' ').reduce((a, b) => a + b)}</Descriptions.Item> : ''
                                }
                                <Descriptions.Item label="Ready" span={3}>{c.ready + ''}</Descriptions.Item>
                                <Descriptions.Item label="Restart Count" span={3}>{c.restartCount}</Descriptions.Item>
                                {
                                    cspec.command ? <Descriptions.Item label="command" span={3}>{`[${cspec.command.join(',')}]`}</Descriptions.Item> : ''
                                }
                                {/* ------ state -------- */}
                                <Descriptions.Item label='state' span={3}>{stateKey}</Descriptions.Item>
                                {
                                    c.state[stateKey].message ?
                                        <Descriptions.Item label="message" span={3}>{c.state[stateKey].message}</Descriptions.Item>
                                        : ''
                                }
                                {
                                    c.state[stateKey].reason ?
                                        <Descriptions.Item label="reason" span={3}>{c.state[stateKey].reason}</Descriptions.Item>
                                        : ''
                                }
                                {
                                    c.state[stateKey].startedAt ?
                                        <Descriptions.Item label="startedAt" span={3}>{c.state[stateKey].startedAt}</Descriptions.Item>
                                        : ''
                                }
                                {
                                    c.state[stateKey].exitCode || c.state[stateKey].exitCode === 0 ?
                                        <Descriptions.Item label="exitCode" span={3}>{c.state[stateKey].exitCode}</Descriptions.Item>
                                        : ''
                                }
                                {
                                    c.state[stateKey].finishedAt ?
                                        <Descriptions.Item label="finishedAt" span={3}>{c.state[stateKey].finishedAt}</Descriptions.Item>
                                        : ''
                                }
                                {/* ------ state end -------- */}
                                {
                                    cspec.volumeMounts ?
                                        <Descriptions.Item label="Volume Mounts" span={3}>
                                            <Table
                                                columns={[{ dataIndex: 'name', title: 'name', width: 100 }, { dataIndex: 'mountPath', title: 'Mount Path', width: 100 }]}
                                                rowKey={record => record.name}
                                                dataSource={cspec.volumeMounts}
                                                size="small"
                                            />
                                        </Descriptions.Item>
                                        : ''
                                }
                                {
                                    cspec.resources ?
                                        <Descriptions.Item label="Resources" span={3}>
                                            {
                                                cspec.resources.requests && cspec.resources.requests.memory ?
                                                    <div>Request-Memory : {cspec.resources.requests.memory}</div>
                                                    : ''
                                            }
                                            {
                                                cspec.resources.requests && cspec.resources.requests.cpu ?
                                                    <div>Request-CPU : {cspec.resources.requests.cpu}</div>
                                                    : ''
                                            }
                                            {
                                                cspec.resources.limits && cspec.resources.limits.memory ?
                                                    <div>Limit-Memory : {cspec.resources.limits.memory}</div>
                                                    : ''
                                            }
                                            {
                                                cspec.resources.limits && cspec.resources.limits.cpu ?
                                                    <div>Limit-CPU: {cspec.resources.limits.cpu}</div>
                                                    : ''
                                            }
                                        </Descriptions.Item>
                                        : ''
                                }
                            </Descriptions>)
                    })

                }
            </div>
        )
    }
}

class PodEnv extends Component {
    //TODO
}

@inject('rootStore')
@observer
class PodVolumes extends Component {

    cloumns = [
        { dataIndex: 'name', title: 'Name', width: 200 },
        { dataIndex: 'kind', title: 'Kind', width: 200 },
        { dataIndex: 'description', title: 'Description', width: 200 },
    ]

    get list() {
        const store = this.props.rootStore.podStore
        const pod = store.currentElement
        const volumes = pod.spec.volumes

        let arr = []
        volumes.forEach(v => {
            let kind = Object.keys(v).find(k => k !== 'name')
            let description = v[kind]
            arr.push({ name: v.name, kind, description: JSON.stringify(description) })
        });
        return arr
    }

    render() {
        return (
            <div>
                <span>Volumes</span>
                <Table
                    columns={this.cloumns}
                    rowKey={record => record.name}
                    dataSource={this.list}
                    size="small"
                />
            </div>
        )
    }
}




@inject('rootStore')
@observer
class PodSummary extends Component {
    render() {
        const store = this.props.rootStore.podStore
        const pod = store.currentElement
        //console.log(pod)
        return (
            <div>
                <PodInfo pod={pod} />
                <Conditions list={pod.status.conditions} />
                <PodVolumes pod={pod} />
                {
                    pod.spec.tolerations ?
                        <div>
                            <span>Taints and Tolerations</span>
                            <Table
                                columns={[{ dataIndex: 'effect', title: 'Effect', width: 200 }, { dataIndex: 'key', title: 'Key', width: 200 }, { dataIndex: 'operator', title: 'Operator', width: 200 }]}
                                rowKey={_ => Math.random().toString().substr(2, 10)}
                                dataSource={pod.spec.tolerations}
                                size="small"
                            />
                        </div>
                        : ''
                }

            </div>
        )
    }
}

@inject('rootStore')
@observer
class PodYaml extends Component {
    componentDidMount() {
        const store = this.props.rootStore.podStore
        store.yamlCurrent = store.yamlText
    }

    render() {
        const store = this.props.rootStore.podStore
        return (
            <div className={'pod'}>
                <Row>
                    <Col><Button onClick={store.update}>更新</Button></Col>
                </Row>
                <CodeMirror
                    style={{ height: '700px', paddingBottom: '20px' }}
                    value={store.yamlText}
                    options={
                        {
                            mode: 'yaml',
                            theme: 'idea',
                            lineNumbers: true
                        }
                    }
                    onChange={(editor, data, value) => {
                        store.yamlCurrent = value;
                    }}
                />
            </div>
        )
    }
}

@inject('rootStore')
@observer
class PodTabs extends Component {
    state = {}
    static getDerivedStateFromProps(props, state) {
        const store = props.rootStore.podStore
        if (!store.currentElement) {
            //props.history.push('/k8s/pod');
            return { shouldgo: false }
        }
        return { shouldgo: true }
    }

    render() {
        const store = this.props.rootStore.podStore
        const pod = store.currentElement
        const operations = <Popconfirm title="确定删除？" onConfirm={store.delete}><Button >删除</Button></Popconfirm>;
        if (this.state.shouldgo) {
            return (
                // 
                <div>
                    <Tag color="#108ee9">Pod {pod.metadata.name}</Tag>
                    <Tabs defaultActiveKey="1" tabBarExtraContent={operations}>
                        <TabPane tab="Summary" key="1">
                            <PodSummary />
                        </TabPane>
                        <TabPane tab="Metadata" key="2">
                            <Metadata info={pod} />
                        </TabPane>
                        <TabPane tab="Yaml" key="3">
                            <PodYaml />
                        </TabPane>
                        <TabPane tab="Terminal" key="4">
                            {
                                pod.spec.containers.length === 1 ?
                                    <TerminalConsole />
                                    :
                                    <Tabs defaultActiveKey={pod.spec.containers[0].name} type="card">
                                        {
                                            pod.spec.containers.map(c => (
                                                <TabPane tab={c.name} key={c.name}>
                                                    <TerminalConsole containerName={c.name} />
                                                </TabPane>
                                            ))
                                        }
                                    </Tabs>
                            }

                        </TabPane>
                        <TabPane tab="Log" key="5">
                            {
                                pod.spec.containers.length === 1 ?
                                    <LogConsole />
                                    :
                                    <Tabs defaultActiveKey={pod.spec.containers[0].name} type="card">
                                        {
                                            pod.spec.containers.map(c => (
                                                <TabPane tab={c.name} key={c.name}>
                                                    <LogConsole containerName={c.name} />
                                                </TabPane>
                                            ))
                                        }
                                    </Tabs>
                            }

                        </TabPane>
                    </Tabs>
                </div>
            )
        } else {
            return <div></div>
        }
    }
}

export { PodTabs }

