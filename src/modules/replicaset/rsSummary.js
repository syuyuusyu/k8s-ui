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
class RsConfiguration extends Component {

    render() {
        const store = this.props.rootStore.rsStore
        const rs = toJS(store.currentElement)
        const deployStore = this.props.rootStore.deployStore
        const deploys = deployStore.list.filter(_ => rs.metadata.ownerReferences.find(ow => ow.uid === _.metadata.uid))
        return (
            <div>
                <Descriptions title={`Info`} size={'small'} bordered>
                    {
                        deploys.map(d =>
                            <Descriptions.Item span={3} key={Math.random().toString().substr(2, 10)} label="Controlled By">
                                <Tag color="success"><Link to={`/k8s/deploy/detail`} onClick={() => { this.props.rootStore.menuStore.goto('deploy', d.metadata.name) }}>{d.metadata.name}</Link></Tag>
                            </Descriptions.Item>)
                    }
                    <Descriptions.Item span={3} label="Replicas">{rs.status.replicas}</Descriptions.Item>
                    <Descriptions.Item span={3} label="Ready Replicas">{rs.status.readyReplicas}</Descriptions.Item>

                </Descriptions>
            </div>
        )
    }
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
        const store = this.props.rootStore.rsStore
        const rs = store.currentElement
        let podRsid = pod.metadata.ownerReferences.map(_ => _.uid)
        return podRsid.find(id => id === rs.metadata.uid)
    }

    render() {
        const store = this.props.rootStore.rsStore
        const rs = store.currentElement
        return (
            <div>
                <RsConfiguration />
                <span>Pods</span>
                <PodTable filterFun={this.filterFun} />
                <PodTemplate kind={store.kind} />
                <PodTemplateVolumes kind={store.kind} />
            </div>
        )
    }
}

@inject('rootStore')
@observer
class RsYaml extends Component {
    componentDidMount() {
        const store = this.props.rootStore.rsStore
        store.yamlCurrent = store.yamlText
    }
    render() {
        const store = this.props.rootStore.rsStore
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
class RsTabs extends Component {
    state = {}
    static getDerivedStateFromProps(props, state) {
        const store = props.rootStore.rsStore
        console.log(toJS(store.currentElement));
        if (!toJS(store.currentElement)) {
            //props.history.push('/k8s/deploy');
            return { shouldgo: false }
        }
        return { shouldgo: true }
    }

    render() {
        const store = this.props.rootStore.rsStore
        const operations = <Popconfirm title="确定删除？" onConfirm={store.delete}><Button danger>删除</Button></Popconfirm>;
        if (this.state.shouldgo) {
            return (
                <div>
                    <Tag color="#108ee9">ReplicaSet {store.currentElement.metadata.name}</Tag>
                    <Tabs defaultActiveKey="1" tabBarExtraContent={operations}>
                        <TabPane tab="Summary" key="1">
                            <DeploySummary />
                        </TabPane>
                        <TabPane tab="Metadata" key="2">
                            <Metadata info={store.currentElement} />
                        </TabPane>
                        <TabPane tab="Yaml" key="3">
                            <RsYaml />
                        </TabPane>
                    </Tabs>
                </div>
            )
        } else {
            return <div></div>
        }
    }
}

export { RsTabs }

