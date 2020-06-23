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
class RcConfiguration extends Component {

    render() {
        const store = this.props.rootStore.store('rc')
        const ele = toJS(store.currentElement)

        return (
            <div>
                <Descriptions title="Status" size={'small'} bordered>
                    {
                        ele.status.availableReplicas ?
                            <Descriptions.Item label="Available Replicas">{ele.status.availableReplicas}</Descriptions.Item>
                            : ''
                    }
                    {
                        ele.status.fullyLabeledReplicas ?
                            <Descriptions.Item label="FullyLabeled Replicas">{ele.status.fullyLabeledReplicas}</Descriptions.Item>
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
                </Descriptions>
            </div>
        )
    }
}





@inject('rootStore')
@observer
class RcSummary extends Component {
    componentDidMount() {

    }
    filterFun = (pod) => {
        if (!pod.metadata.ownerReferences) {
            return false
        }
        const ds = this.props.rootStore.element('rc')
        let podRsid = pod.metadata.ownerReferences.map(_ => _.uid)
        return podRsid.find(id => id === ds.metadata.uid)
    }

    render() {
        return (
            <div>
                <RcConfiguration />
                <span>Pods</span>
                <PodTable filterFun={this.filterFun} />
                <PodTemplate kind={'rc'} />
                <PodTemplateVolumes kind={'rc'} />

            </div>
        )
    }
}

@inject('rootStore')
@observer
class RcYaml extends Component {
    componentDidMount() {
        const store = this.props.rootStore.rcStore
        store.yamlCurrent = store.yamlText
    }
    render() {
        const store = this.props.rootStore.rcStore
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
class RcTabs extends Component {
    state = {}
    static getDerivedStateFromProps(props, state) {
        const store = props.rootStore.rcStore
        console.log(toJS(store.currentElement));
        if (!toJS(store.currentElement)) {
            //props.history.push('/k8s/deploy');
            return { shouldgo: false }
        }
        return { shouldgo: true }
    }

    render() {
        const store = this.props.rootStore.rcStore
        const operations = <Popconfirm title="确定删除？" onConfirm={store.delete}><Button danger>删除</Button></Popconfirm>;
        if (this.state.shouldgo) {
            return (
                <div>
                    <Tag color="#108ee9">StatefulSet {store.currentElement.metadata.name}</Tag>
                    <Tabs defaultActiveKey="1" tabBarExtraContent={operations}>
                        <TabPane tab="Summary" key="1">
                            <RcSummary />
                        </TabPane>
                        <TabPane tab="Metadata" key="2">
                            <Metadata info={store.currentElement} />
                        </TabPane>
                        <TabPane tab="Yaml" key="3">
                            <RcYaml />
                        </TabPane>
                    </Tabs>
                </div>
            )
        } else {
            return <div></div>
        }
    }
}

export { RcTabs }

