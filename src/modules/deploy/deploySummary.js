import React, { Component } from 'react';
import {
    Table, Button, Descriptions, Tabs, Row, Col, Popconfirm, Tag
} from 'antd';
const { TabPane } = Tabs;
import { inject, observer } from 'mobx-react';
import { toJS } from 'mobx';
import { Conditions, Metadata } from '../common'
import { PodTable } from '../pod'

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
class DeployConfiguration extends Component {

    render() {
        const store = this.props.rootStore.deployStore
        const deploy = toJS(store.currentElement)
        return (
            <div>
                <Descriptions title={`Info`} size={'small'} bordered>
                    {
                        deploy.spec.strategy ?
                            <Descriptions.Item label="Deployment Strategy">{deploy.spec.strategy.type}</Descriptions.Item>
                            : ''
                    }
                    {
                        deploy.spec.strategy && deploy.spec.strategy.rollingUpdate ?
                            < Descriptions.Item span={2} label="Rolling Update Strategy">{`Max Surge ${deploy.spec.strategy.rollingUpdate.maxSurge}, Max Unavailable ${deploy.spec.strategy.rollingUpdate.maxUnavailable}`}</Descriptions.Item>
                            : ''
                    }
                    <Descriptions.Item label="Progress Deadline Seconds">{deploy.spec.progressDeadlineSeconds}</Descriptions.Item>
                    <Descriptions.Item label="Revision History Limit">{deploy.spec.revisionHistoryLimit}</Descriptions.Item>
                    <Descriptions.Item label="Replicas">{deploy.spec.replicas}</Descriptions.Item>
                    <Descriptions.Item span={3} label="Selectors">{this.props.rootStore.columnStore.createLabels(deploy.spec.selector.matchLabels)}</Descriptions.Item>
                </Descriptions>
                <Descriptions title="Status" size={'small'} bordered>
                    {
                        deploy.status.availableReplicas ?
                            <Descriptions.Item label="Available Replicas">{deploy.status.availableReplicas}</Descriptions.Item>
                            : ''
                    }
                    {
                        deploy.status.readyReplicas ?
                            <Descriptions.Item label="Ready Replicas">{deploy.status.readyReplicas}</Descriptions.Item>
                            : ''
                    }
                    {
                        deploy.status.updatedReplicas ?
                            <Descriptions.Item label="Updated Replicas">{deploy.status.updatedReplicas}</Descriptions.Item>
                            : ''
                    }
                    {
                        deploy.status.replicas ?
                            <Descriptions.Item label="Replicas">{deploy.status.replicas}</Descriptions.Item>
                            : ''
                    }
                    {
                        deploy.status.observedGeneration ?
                            <Descriptions.Item label="Observed Generation">{deploy.status.observedGeneration}</Descriptions.Item>
                            : ''
                    }
                    {
                        deploy.status.unavailableReplicas ?
                            <Descriptions.Item label="Unavailable Replicas">{deploy.status.unavailableReplicas}</Descriptions.Item>
                            : ''
                    }
                </Descriptions>
            </div>
        )
    }
}


@inject('rootStore')
@observer
class templateTable extends Component {

}



@inject('rootStore')
@observer
class DeploySummary extends Component {
    componentDidMount() {

    }
    filterFun = (pod) => {
        if (!pod.metadata.ownerReferences) {
            return false
        }
        const store = this.props.rootStore.deployStore
        const deploy = store.currentElement
        const rsList = this.props.rootStore.rsStore.list
            .filter(r => r.metadata.ownerReferences.filter(d => d.uid == deploy.metadata.uid).length > 0)
            .map(r => r.metadata.uid)
        let podRsid = pod.metadata.ownerReferences.map(_ => _.uid)
        return rsList.find(_ => podRsid.find(id => id == _))
    }
    render() {
        const store = this.props.rootStore.deployStore
        const deploy = store.currentElement
        return (
            <div>
                <DeployConfiguration />
                <span>Pods</span>
                <PodTable filterFun={this.filterFun} />
                <Conditions list={store.currentElement.status.conditions} />
                <DeployVolumes deploy={deploy} />

                {
                    deploy.spec.template.spec.tolerations ?
                        <div>
                            <span>Taints and Tolerations</span>
                            <Table
                                columns={[{ dataIndex: 'effect', title: 'Effect', width: 200 }, { dataIndex: 'key', title: 'Key', width: 200 }, { dataIndex: 'operator', title: 'Operator', width: 200 }]}
                                rowKey={_ => Math.random().toString().substr(2, 10)}
                                dataSource={deploy.spec.template.spec.tolerations}
                                size="small"
                            />
                        </div>
                        : ''
                }

            </div>
        )
    }
}

class DeployVolumes extends Component {

    cloumns = [
        { dataIndex: 'name', title: 'Name', width: 200 },
        { dataIndex: 'kind', title: 'Kind', width: 200 },
        { dataIndex: 'description', title: 'Description', width: 200 },
    ]

    get list() {
        const deploy = this.props.deploy
        const volumes = deploy.spec.template.spec.volumes
        if (!volumes) {
            return []
        }
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
class DeployYaml extends Component {
    componentDidMount() {
        const store = this.props.rootStore.deployStore
        store.yamlCurrent = store.yamlText
    }
    render() {
        const store = this.props.rootStore.deployStore
        store.yamlCurrent = store.yamlText
        return (
            <div className={'pod'}>
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <Button onClick={store.update}>更新</Button>
                </div>
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
class DeployTabs extends Component {
    state = {}
    static getDerivedStateFromProps(props, state) {
        const store = props.rootStore.deployStore
        console.log(toJS(store.currentElement));
        if (!toJS(store.currentElement)) {
            //props.history.push('/k8s/deploy');
            return { shouldgo: false }
        }
        return { shouldgo: true }
    }

    render() {
        const store = this.props.rootStore.deployStore
        const operations = <Popconfirm title="确定删除？" onConfirm={store.delete}><Button >删除</Button></Popconfirm>;
        if (this.state.shouldgo) {
            return (
                <div>
                    <Tag color="#108ee9">Deployment {store.currentElement.metadata.name}</Tag>
                    <Tabs defaultActiveKey="1" tabBarExtraContent={operations}>
                        <TabPane tab="Summary" key="1">
                            <DeploySummary />
                        </TabPane>
                        <TabPane tab="Metadata" key="2">
                            <Metadata info={store.currentElement} />
                        </TabPane>
                        <TabPane tab="Yaml" key="3">
                            <DeployYaml />
                        </TabPane>
                    </Tabs>
                </div>
            )
        } else {
            return <div></div>
        }
    }
}

export { DeployTabs }

