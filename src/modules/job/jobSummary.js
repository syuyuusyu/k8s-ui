
import React, { Component } from 'react';
import {
    Modal, Badge, Icon, Input, Table, Dropdown, Menu, Button, Divider, Popconfirm, Descriptions, Tabs, Tag, Row, Col
} from 'antd';
import { Link } from 'react-router-dom';
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
class JobConfiguration extends Component {

    render() {
        const store = this.props.rootStore.store('job')
        const ele = toJS(store.currentElement)

        return (
            <div>
                <Descriptions title="Info" size={'small'} bordered>
                    {
                        ele.spec.backoffLimit ?
                            <Descriptions.Item label="Back Off Limit">{ele.spec.backoffLimit}</Descriptions.Item>
                            : ''
                    }
                    {
                        ele.spec.completions ?
                            <Descriptions.Item label="Completions">{ele.spec.completions}</Descriptions.Item>
                            : ''
                    }
                    {
                        ele.spec.parallelism ?
                            <Descriptions.Item label="Parallelism">{ele.spec.parallelism}</Descriptions.Item>
                            : ''
                    }
                </Descriptions>
                <Descriptions title="Status" size={'small'} bordered>
                    {
                        ele.status.startTime ?
                            <Descriptions.Item label="Start Time">{ele.status.startTime}</Descriptions.Item>
                            : ''
                    }
                    {
                        ele.status.completionTime ?
                            <Descriptions.Item label="Completion Time">{ele.status.completionTime}</Descriptions.Item>
                            : ''
                    }
                    {
                        ele.status.succeeded ?
                            <Descriptions.Item label="succeeded">{ele.status.succeeded}</Descriptions.Item>
                            : ''
                    }
                </Descriptions>
            </div>
        )
    }
}





@inject('rootStore')
@observer
class JobSummary extends Component {
    componentDidMount() {

    }
    filterFun = (pod) => {
        if (!pod.metadata.ownerReferences) {
            return false
        }
        const ds = this.props.rootStore.element('job')
        let podRsid = pod.metadata.ownerReferences.map(_ => _.uid)
        return podRsid.find(id => id === ds.metadata.uid)
    }

    render() {
        return (
            <div>
                <JobConfiguration />
                <span>Pods</span>
                <PodTable filterFun={this.filterFun} />
            </div>
        )
    }
}

@inject('rootStore')
@observer
class JobYaml extends Component {
    componentDidMount() {
        const store = this.props.rootStore.jobStore
        store.yamlCurrent = store.yamlText
    }
    render() {
        const store = this.props.rootStore.jobStore
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
class JobTabs extends Component {
    state = {}
    static getDerivedStateFromProps(props, state) {
        const ele = props.rootStore.element('job')
        if (!ele) {
            //props.history.push('/k8s/deploy');
            return { shouldgo: false }
        }
        return { shouldgo: true }
    }

    render() {
        const store = this.props.rootStore.store('job')
        const operations = <Popconfirm title="确定删除？" onConfirm={store.delete}><Button danger>删除</Button></Popconfirm>;
        if (this.state.shouldgo) {
            return (
                <div>
                    <Tag color="#108ee9" style={{ height: 32, width: 'auto', fontSize: 24, paddingTop: 4 }}>Job {store.currentElement.metadata.name}</Tag>
                    <Tabs defaultActiveKey="1" tabBarExtraContent={operations}>
                        <TabPane tab="Summary" key="1">
                            <JobSummary />
                        </TabPane>
                        <TabPane tab="Metadata" key="2">
                            <Metadata info={store.currentElement} />
                        </TabPane>
                        <TabPane tab="Yaml" key="3">
                            <JobYaml />
                        </TabPane>
                    </Tabs>
                </div>
            )
        } else {
            return <div></div>
        }
    }
}

export { JobTabs }

