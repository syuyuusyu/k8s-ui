import React, { Component } from 'react';
import {
    Modal, Badge, Icon, Input, Table, Alert, Menu, Button, Divider, Popconfirm, Descriptions, Tabs, Row, Col, Tag, Tooltip, Drawer
} from 'antd';
import { Link } from 'react-router-dom';
const { TabPane } = Tabs;
import { inject, observer } from 'mobx-react';
import { Liquid } from '@ant-design/charts';
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
import { DeleteIcon } from '../../config/icon'
import Demo from './create.js'


@inject('rootStore')
@observer
class PodInfo extends Component {

    render() {
        const store = this.props.rootStore.podStore

        const pod = store.currentElement
        console.log(pod);
        let controlled = []
        if (pod.metadata.ownerReferences) {
            controlled = pod.metadata.ownerReferences.map(ow => ({ name: ow.name, short: this.props.rootStore.shortName(ow.kind) }))
        }

        return (
            <div>
                <Descriptions title={`Info`} size={'small'} bordered>
                    {
                        controlled.map(d =>
                            <Descriptions.Item span={3} key={Math.random().toString().substr(2, 10)} label="Controlled By">
                                <Tag color="success"><Link to={`/k8s/${d.short}/detail`} onClick={() => { this.props.rootStore.menuStore.goto(d.short, d.name) }}>{d.name}</Link></Tag>
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
                    pod.status.containerStatuses ? pod.status.containerStatuses.map(c => {
                        let cspec = pod.spec.containers.find(_ => _.name === c.name)
                        let stateKey = Object.keys(c.state)[0]
                        let met = store.liquidConfig.find(_ => _.name === c.name)
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
                                {
                                    cspec.args ? <Descriptions.Item label="args" span={3}>{`[${cspec.args.join(',')}]`}</Descriptions.Item> : ''
                                }
                                {/* ------ state -------- */}
                                <Descriptions.Item label='State' span={3}><Alert message={stateKey} type={stateKey == 'running' ? 'success' : 'error'} showIcon /></Descriptions.Item>
                                {
                                    c.state[stateKey].message ?
                                        <Descriptions.Item label="message" span={3}><Alert message={c.state[stateKey].message} type={'info'} /></Descriptions.Item>
                                        : ''
                                }
                                {
                                    c.state[stateKey].reason ?
                                        <Descriptions.Item label="reason" span={3}><Alert message={c.state[stateKey].reason} type={'warning'} /></Descriptions.Item>
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
                                    met ?
                                        <Descriptions.Item label="Metrics" span={3}>
                                            {
                                                met.config ?
                                                    <Row>
                                                        {
                                                            met.config.map(config => <Col key={Math.random().toString().substr(2, 10)} style={{ textAlign: 'center' }} span={12}><Liquid {...config} color="#2db7f5" width={200} height={200} alignTo='middle' /></Col>)
                                                        }
                                                    </Row>
                                                    :
                                                    <Row>
                                                        <Col style={{ textAlign: 'center' }} span={12}><Tag color="#2db7f5">CPU使用 {met.cpu}</Tag></Col>
                                                        <Col style={{ textAlign: 'center' }} span={12}><Tag color="#2db7f5">Memory使用 {met.memory}</Tag></Col>
                                                    </Row>
                                            }
                                        </Descriptions.Item>
                                        : ''
                                }
                                {
                                    store.volumeMountList.filter(_ => _.containerName === c.name).length > 0 ?
                                        <Descriptions.Item label="Volume Mounts" span={3}>
                                            <Table
                                                columns={[
                                                    { dataIndex: 'name', title: 'name', width: 150 },
                                                    { dataIndex: 'kind', title: 'Kind', width: 100 },
                                                    { dataIndex: 'mountPath', title: 'Mount Path', width: 100 },
                                                    { dataIndex: 'subPath', title: 'Sub Path', width: 100 },
                                                    {
                                                        dataIndex: 'refName', title: 'Link', width: 100,
                                                        render: (v, record) => {
                                                            if (!v) {
                                                                return ''
                                                            }
                                                            const short = this.props.rootStore.shortName(record.kind)
                                                            return <Tag color="success"><a onClick={() => { this.props.rootStore.menuStore.goto(short, v, null, `/k8s/${short}/detail`) }}>{v}</a></Tag>
                                                        }
                                                    }
                                                ]}
                                                rowKey={record => record.name}
                                                dataSource={store.volumeMountList.filter(_ => _.containerName === c.name)}
                                                size="small"
                                                pagination={{ pageSize: 5 }}
                                            />
                                        </Descriptions.Item>
                                        : ''
                                }
                                {
                                    store.envList.filter(_ => _.containerName === c.name).length > 0 ?
                                        <Descriptions.Item label="Env" span={3}>
                                            <Table
                                                columns={[
                                                    { dataIndex: 'name', title: 'name', width: 120 },
                                                    { dataIndex: 'kind', title: 'Kind', width: 70 },
                                                    {
                                                        dataIndex: 'value', title: 'Value', width: 300,
                                                        render: v => {
                                                            if(!v) return ''
                                                            v = v.trim()
                                                            if (v.length > 40) {
                                                                return <Tooltip title={v}><div style={{ width: '300px' }}>{v.substr(0, 28) + '...'}</div></Tooltip>
                                                            }
                                                            return <div style={{ width: '300px' }}>{v}</div>
                                                        }
                                                    },
                                                    {
                                                        dataIndex: 'refName', title: 'Link', width: 100,
                                                        render: (v, record) => {
                                                            if (!v) {
                                                                return ''
                                                            }
                                                            const short = this.props.rootStore.shortName(record.kind)
                                                            return <Tag color="success"><a onClick={() => { this.props.rootStore.menuStore.goto(short, v, null, `/k8s/${short}/detail`) }}>{v}</a></Tag>
                                                        }
                                                    },
                                                ]}
                                                rowKey={record => record.name}
                                                dataSource={store.envList.filter(_ => _.containerName === c.name)}
                                                size="small"
                                                pagination={{ pageSize: 5 }}
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
                    }) : ''

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
        { dataIndex: 'name', title: 'Name', width: 150 },
        { dataIndex: 'kind', title: 'Kind', width: 100 },
        { dataIndex: 'description', title: 'Description', width: 200 },
        {
            dataIndex: 'refName', title: 'Link', width: 200,
            render: (v, record) => {
                if (!v) {
                    return ''
                }
                const short = this.props.rootStore.shortName(record.kind)
                return <Tag color="success"><a onClick={() => { this.props.rootStore.menuStore.goto(short, v, null, `/k8s/${short}/detail`) }}>{v}</a></Tag>
            }
        }
    ]

    render() {
        const store = this.props.rootStore.store('pod')
        return (
            <div>
                <span>Volumes</span>
                <Table
                    columns={this.cloumns}
                    rowKey={record => record.name}
                    dataSource={store.volumeList}
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
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <Button onClick={store.update} type="primary">更新</Button></div>
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
        const operations = <Popconfirm title="确定删除？" onConfirm={store.delete}><Button danger icon={<DeleteIcon />}>删除</Button></Popconfirm>;
        if (this.state.shouldgo) {
            return (
                <div>
                    <Tag color="#108ee9" style={{ height: 32, width: 'auto', fontSize: 24, paddingTop: 4 }}>Pod {pod.metadata.name}</Tag>
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

