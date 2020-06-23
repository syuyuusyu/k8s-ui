import React, { Component } from 'react';
import {
    Modal, Badge, Icon, Input, Table, Dropdown, Menu, Button, Divider, Popconfirm, Descriptions, Tabs, Tag, Row, Col
} from 'antd';
import { Link } from 'react-router-dom';
const { TabPane } = Tabs;
import { inject, observer } from 'mobx-react';
import { toJS } from 'mobx';
import { Conditions, Metadata, PodTemplate, PodTemplateVolumes } from '../common'
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
class StsConfiguration extends Component {

    render() {
        const store = this.props.rootStore.store('sts')
        const ele = toJS(store.currentElement)

        return (
            <div>
                <Descriptions title={`Info`} size={'small'} bordered>
                    {
                        ele.spec.strategy ?
                            <Descriptions.Item label="Update Strategy">{ele.spec.strategy.type}</Descriptions.Item>
                            : ''
                    }
                    {
                        ele.spec.strategy && ele.spec.strategy.rollingUpdate ?
                            < Descriptions.Item label="Rolling Update Strategy">{`Max Surge ${ele.spec.strategy.rollingUpdate.maxSurge}, Max Unavailable ${ele.spec.strategy.rollingUpdate.maxUnavailable}`}</Descriptions.Item>
                            : ''
                    }

                    <Descriptions.Item label="Revision History Limit">{ele.spec.revisionHistoryLimit}</Descriptions.Item>
                    <Descriptions.Item label="Pod Management Policy">{ele.spec.podManagementPolicy}</Descriptions.Item>
                    <Descriptions.Item label="Selectors">{this.props.rootStore.columnStore.createLabels(ele.spec.selector.matchLabels)}</Descriptions.Item>
                </Descriptions>
                <Descriptions title="Status" size={'small'} bordered>
                    {
                        ele.status.collisionCount ?
                            <Descriptions.Item label="Collision Count">{ele.status.collisionCount}</Descriptions.Item>
                            : ''
                    }
                    {
                        ele.status.currentReplicas ?
                            <Descriptions.Item label="Current Replicas">{ele.status.currentReplicas}</Descriptions.Item>
                            : ''
                    }
                    {
                        ele.status.currentRevision ?
                            <Descriptions.Item label="Current Revision">{ele.status.currentRevision}</Descriptions.Item>
                            : ''
                    }
                    {
                        ele.status.observedGeneration ?
                            <Descriptions.Item label="Observed Generation">{ele.status.observedGeneration}</Descriptions.Item>
                            : ''
                    }
                    {
                        ele.status.readyReplicas ?
                            <Descriptions.Item label="Ready Replicas">{ele.status.readyReplicas}</Descriptions.Item>
                            : ''
                    }
                    {
                        ele.status.replicas ?
                            <Descriptions.Item label="Replicas">{ele.status.replicas}</Descriptions.Item>
                            : ''
                    }
                    {
                        ele.status.updateRevision ?
                            <Descriptions.Item label="Update Revision">{ele.status.updateRevision}</Descriptions.Item>
                            : ''
                    }
                    {
                        ele.status.updatedReplicas ?
                            <Descriptions.Item label="Updated Replicas">{ele.status.updatedReplicas}</Descriptions.Item>
                            : ''
                    }
                </Descriptions>
            </div>
        )
    }
}





@inject('rootStore')
@observer
class StsSummary extends Component {
    componentDidMount() {

    }
    filterFun = (pod) => {
        if (!pod.metadata.ownerReferences) {
            return false
        }
        const ds = this.props.rootStore.element('sts')
        let podRsid = pod.metadata.ownerReferences.map(_ => _.uid)
        return podRsid.find(id => id === ds.metadata.uid)
    }

    render() {
        return (
            <div>
                <StsConfiguration />
                <span>Pods</span>
                <PodTable filterFun={this.filterFun} />
                {/* <PodTemplate kind={'sts'} />
                <PodTemplateVolumes kind={'sts'} /> */}
            </div>
        )
    }
}

@inject('rootStore')
@observer
class StsYaml extends Component {
    componentDidMount() {
        const store = this.props.rootStore.stsStore
        store.yamlCurrent = store.yamlText
    }
    render() {
        const store = this.props.rootStore.stsStore
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
class StsTabs extends Component {
    state = {}
    static getDerivedStateFromProps(props, state) {
        const store = props.rootStore.stsStore
        console.log(toJS(store.currentElement));
        if (!toJS(store.currentElement)) {
            //props.history.push('/k8s/deploy');
            return { shouldgo: false }
        }
        return { shouldgo: true }
    }

    render() {
        const store = this.props.rootStore.stsStore
        const operations = <Popconfirm title="确定删除？" onConfirm={store.delete}><Button danger>删除</Button></Popconfirm>;
        if (this.state.shouldgo) {
            return (
                <div>
                    <Tag color="#108ee9">StatefulSet {store.currentElement.metadata.name}</Tag>
                    <Tabs defaultActiveKey="1" tabBarExtraContent={operations}>
                        <TabPane tab="Summary" key="1">
                            <StsSummary />
                        </TabPane>
                        <TabPane tab="Metadata" key="2">
                            <Metadata info={store.currentElement} />
                        </TabPane>
                        <TabPane tab="Yaml" key="3">
                            <StsYaml />
                        </TabPane>
                    </Tabs>
                </div>
            )
        } else {
            return <div></div>
        }
    }
}

export { StsTabs }

