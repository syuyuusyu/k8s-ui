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
class DsConfiguration extends Component {

    render() {
        const store = this.props.rootStore.store('ds')
        const ele = toJS(store.currentElement)

        return (
            <div>
                <Descriptions title={`Info`} size={'small'} bordered>
                    {
                        ele.spec.strategy ?
                            <Descriptions.Item label="Deployment Strategy">{ele.spec.strategy.type}</Descriptions.Item>
                            : ''
                    }
                    {
                        ele.spec.strategy && ele.spec.strategy.rollingUpdate ?
                            < Descriptions.Item span={2} label="Rolling Update Strategy">{`Max Surge ${ele.spec.strategy.rollingUpdate.maxSurge}, Max Unavailable ${ele.spec.strategy.rollingUpdate.maxUnavailable}`}</Descriptions.Item>
                            : ''
                    }

                    <Descriptions.Item label="Revision History Limit">{ele.spec.revisionHistoryLimit}</Descriptions.Item>

                    <Descriptions.Item span={3} label="Selectors">{this.props.rootStore.columnStore.createLabels(ele.spec.selector.matchLabels)}</Descriptions.Item>
                </Descriptions>
                <Descriptions title="Status" size={'small'} bordered>
                    {
                        ele.status.currentNumberScheduled ?
                            <Descriptions.Item label="Current Number Scheduled">{ele.status.currentNumberScheduled}</Descriptions.Item>
                            : ''
                    }
                    {
                        ele.status.desiredNumberScheduled ?
                            <Descriptions.Item label="Desired Number Scheduled">{ele.status.desiredNumberScheduled}</Descriptions.Item>
                            : ''
                    }
                    {
                        ele.status.numberAvailable ?
                            <Descriptions.Item label="Number Available">{ele.status.numberAvailable}</Descriptions.Item>
                            : ''
                    }
                    {
                        ele.status.numberMisscheduled ?
                            <Descriptions.Item label="Number Mis-scheduled">{ele.status.numberMisscheduled}</Descriptions.Item>
                            : ''
                    }
                    {
                        ele.status.numberReady ?
                            <Descriptions.Item label="Number Ready">{ele.status.numberReady}</Descriptions.Item>
                            : ''
                    }
                    {
                        ele.status.updatedNumberScheduled ?
                            <Descriptions.Item label="Updated Number Scheduled">{ele.status.updatedNumberScheduled}</Descriptions.Item>
                            : ''
                    }
                    {
                        ele.status.observedGeneration ?
                            <Descriptions.Item label="Observed Generation">{ele.status.observedGeneration}</Descriptions.Item>
                            : ''
                    }
                </Descriptions>
            </div>
        )
    }
}





@inject('rootStore')
@observer
class DsSummary extends Component {
    componentDidMount() {

    }
    filterFun = (pod) => {
        if (!pod.metadata.ownerReferences) {
            return false
        }
        const ds = this.props.rootStore.element('ds')
        let podRsid = pod.metadata.ownerReferences.map(_ => _.uid)
        return podRsid.find(id => id === ds.metadata.uid)
    }

    render() {

        return (
            <div>
                <DsConfiguration />
                <span>Pods</span>
                <PodTable filterFun={this.filterFun} />
                <PodTemplate kind={'ds'} />
                <PodTemplateVolumes kind={'ds'} />
            </div>
        )
    }
}

@inject('rootStore')
@observer
class DsYaml extends Component {
    componentDidMount() {
        const store = this.props.rootStore.dsStore
        store.yamlCurrent = store.yamlText
    }
    render() {
        const store = this.props.rootStore.dsStore
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
class DsTabs extends Component {
    state = {}
    static getDerivedStateFromProps(props, state) {
        const store = props.rootStore.dsStore
        console.log(toJS(store.currentElement));
        if (!toJS(store.currentElement)) {
            //props.history.push('/k8s/deploy');
            return { shouldgo: false }
        }
        return { shouldgo: true }
    }

    render() {
        const store = this.props.rootStore.dsStore
        const operations = <Popconfirm title="确定删除？" onConfirm={store.delete}><Button danger>删除</Button></Popconfirm>;
        if (this.state.shouldgo) {
            return (
                <div>
                    <Tag color="#108ee9">DaemonSet {store.currentElement.metadata.name}</Tag>
                    <Tabs defaultActiveKey="1" tabBarExtraContent={operations}>
                        <TabPane tab="Summary" key="1">
                            <DsSummary />
                        </TabPane>
                        <TabPane tab="Metadata" key="2">
                            <Metadata info={store.currentElement} />
                        </TabPane>
                        <TabPane tab="Yaml" key="3">
                            <DsYaml />
                        </TabPane>
                    </Tabs>
                </div>
            )
        } else {
            return <div></div>
        }
    }
}

export { DsTabs }

