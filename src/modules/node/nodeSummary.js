import React, { Component } from 'react';
import {
    Modal, Badge, Icon, Input, Table, Dropdown, Menu, Button, Divider, Popconfirm, Descriptions, Tabs, Tag
} from 'antd';
const { TabPane } = Tabs;
import { inject, observer } from 'mobx-react';
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
class NodeConfiguration extends Component {

    render() {
        const store = this.props.rootStore.nodeStore
        const info = toJS(store.currentElement.status.nodeInfo)
        return (
            <Descriptions title="Configuration" size={'small'} bordered>
                <Descriptions.Item label="Architecture">{info.architecture}</Descriptions.Item>
                <Descriptions.Item label="Boot ID">{info.bootID}</Descriptions.Item>
                <Descriptions.Item label="Container Runtime Version">{info.containerRuntimeVersion}</Descriptions.Item>
                <Descriptions.Item label="Kernel Version">{info.kernelVersion}</Descriptions.Item>
                <Descriptions.Item label="KubeProxy Version">{info.kubeletVersion}</Descriptions.Item>
                <Descriptions.Item label="Kubelet Version">{info.kubeletVersion}</Descriptions.Item>
                <Descriptions.Item label="Operating System">{info.operatingSystem}</Descriptions.Item>
                <Descriptions.Item label="Machine ID">{info.machineID}</Descriptions.Item>
                <Descriptions.Item label="OS Image">{info.osImage}</Descriptions.Item>
                <Descriptions.Item label="Pod CIDR">{info.podCidr}</Descriptions.Item>
                <Descriptions.Item label="System UUID">{info.systemUUID}</Descriptions.Item>
            </Descriptions>
        )
    }
}

@inject('rootStore')
@observer
class NodeAddresses extends Component {

    cloumns = [
        { dataIndex: 'type', title: 'Type', width: 200 },
        { dataIndex: 'address', title: 'address', width: 200 }
    ]

    render() {
        const store = this.props.rootStore.nodeStore
        const list = toJS(store.currentElement.status.addresses)
        return (
            <div>
                <span>Addresses</span>
                <Table
                    columns={this.cloumns}
                    rowKey={record => record.type}
                    dataSource={list}
                    size="small"
                />
            </div>
        )
    }
}


@inject('rootStore')
@observer
class NodeResources extends Component {

    cloumns = [
        { dataIndex: 'key', title: 'Key', width: 200 },
        { dataIndex: 'Capacity', title: 'Capacity', width: 200 },
        { dataIndex: 'Allocatable', title: 'Allocatable', width: 200 }
    ]

    render() {
        const store = this.props.rootStore.nodeStore
        let c = toJS(store.currentElement.status.capacity)
        let a = toJS(store.currentElement.status.allocatable)
        const list = []
        for (let key in a) {
            list.push({ key: key, Capacity: c[key], Allocatable: a[key] })
        }
        return (
            <div>
                <span>Resources</span>
                <Table
                    columns={this.cloumns}
                    rowKey={record => record.key}
                    dataSource={list}
                    size="small"
                />
            </div>
        )
    }
}

@inject('rootStore')
@observer
class NodeImages extends Component {

    cloumns = [
        {
            dataIndex: 'names', title: 'name', width: 400,
            render: (value) => {
                return value.map(_ => <div key={Math.random().toString().substr(2, 10)}>{_}</div>)
            }
        },
        { dataIndex: 'sizeBytes', title: 'size', width: 100, render: convertGigaFormat }
    ]

    render() {
        const store = this.props.rootStore.nodeStore
        const list = toJS(store.currentElement.status.images)
        return (
            <div>
                <span>Images</span>
                <Table
                    columns={this.cloumns}
                    rowKey={_ => Math.random().toString().substr(2, 10) + ''}
                    dataSource={list}
                    size="small"
                />
            </div>
        )
    }
}

@inject('rootStore')
@observer
class NodeSummary extends Component {
    render() {
        const store = this.props.rootStore.nodeStore
        return (
            <div>
                <NodeConfiguration />
                <NodeAddresses />
                <NodeResources />
                <Conditions list={store.currentElement.status.conditions} />
                <NodeImages />
            </div>
        )
    }
}

@inject('rootStore')
@observer
class NodeYaml extends Component {
    render() {
        const store = this.props.rootStore.nodeStore
        return (
            <div className={'pod'}>
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
                />
            </div>
        )
    }
}

@inject('rootStore')
@observer
class NodeTabs extends Component {
    state = {}
    static getDerivedStateFromProps(props, state) {
        const store = props.rootStore.nodeStore
        if (!store.currentElement) {
            props.history.push('/k8s/node');
            return { shouldgo: false }
        }
        return { shouldgo: true }
    }

    render() {
        const store = this.props.rootStore.nodeStore
        if (this.state.shouldgo) {
            return (
                <div>
                    <Tag color="#108ee9" style={{ height: 32, width: 'auto', fontSize: 24, paddingTop: 4 }}>Node {store.currentElement.metadata.name}</Tag>
                    <Tabs defaultActiveKey="1" >
                        <TabPane tab="Summary" key="1">
                            <NodeSummary />
                        </TabPane>
                        <TabPane tab="Metadata" key="2">
                            <Metadata info={store.currentElement} />
                        </TabPane>
                        <TabPane tab="Yaml" key="3">
                            <NodeYaml />
                        </TabPane>
                    </Tabs>
                </div>
            )
        } else {
            return <div></div>
        }
    }
}

export { NodeTabs }

