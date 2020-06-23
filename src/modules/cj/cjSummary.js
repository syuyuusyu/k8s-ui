
import React, { Component } from 'react';
import {
    Modal, Badge, Icon, Input, Table, Dropdown, Menu, Button, Divider, Popconfirm, Descriptions, Tabs, Tag, Row, Col
} from 'antd';
import { Link } from 'react-router-dom';
const { TabPane } = Tabs;
import { inject, observer } from 'mobx-react';
import { toJS } from 'mobx';
import { Conditions, Metadata } from '../common'
import { JobTable } from '../job'

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

import { CjIcon } from '../../config/icon'


@inject('rootStore')
@observer
class CjConfiguration extends Component {
    //     Configuration
    //     Schedule	*/1 * * * *
    // Suspend	false
    // Concurrency Policy	Allow
    // Successful Job History Limit	3
    // Failed Job History Limit	1
    render() {
        const store = this.props.rootStore.store('cj')
        const ele = toJS(store.currentElement)

        return (
            <div>
                <Descriptions title="Info" size={'small'} bordered>
                    {
                        ele.spec.schedule ?
                            <Descriptions.Item span={3} label="Schedule">{ele.spec.schedule}</Descriptions.Item>
                            : ''
                    }
                    {
                        ele.spec.suspend ?
                            <Descriptions.Item span={3} label="Suspend">{ele.spec.suspend}</Descriptions.Item>
                            : ''
                    }
                    {
                        ele.spec.concurrencyPolicy ?
                            <Descriptions.Item span={3} label="Concurrency Policy">{ele.spec.concurrencyPolicy}</Descriptions.Item>
                            : ''
                    }
                    {
                        ele.spec.successfulJobsHistoryLimit ?
                            <Descriptions.Item span={3} label="Successful Job History Limit">{ele.spec.successfulJobsHistoryLimit}</Descriptions.Item>
                            : ''
                    }
                    {
                        ele.spec.failedJobsHistoryLimit ?
                            <Descriptions.Item span={3} label="Failed Job History Limit">{ele.spec.failedJobsHistoryLimit}</Descriptions.Item>
                            : ''
                    }
                </Descriptions>
            </div>
        )
    }
}





@inject('rootStore')
@observer
class CjSummary extends Component {
    componentDidMount() {

    }
    filterFun = (job) => {
        if (!job.metadata.ownerReferences) {
            return false
        }
        const cj = this.props.rootStore.element('cj')
        let jobid = job.metadata.ownerReferences.map(_ => _.uid)
        return jobid.find(id => id === cj.metadata.uid)
    }

    render() {
        return (
            <div>
                <CjConfiguration />
                <span>JobS</span>
                <JobTable filterFun={this.filterFun} />
            </div>
        )
    }
}

@inject('rootStore')
@observer
class CjYaml extends Component {
    componentDidMount() {
        const store = this.props.rootStore.store('cj')
        store.yamlCurrent = store.yamlText
    }
    render() {
        const store = this.props.rootStore.store('cj')
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
class CjTabs extends Component {
    state = {}
    static getDerivedStateFromProps(props, state) {
        const ele = props.rootStore.element('cj')
        if (!ele) {
            //props.history.push('/k8s/deploy');
            return { shouldgo: false }
        }
        return { shouldgo: true }
    }

    render() {
        const store = this.props.rootStore.store('cj')
        const operations = <Popconfirm title="确定删除？" onConfirm={store.delete}><Button danger>删除</Button></Popconfirm>;
        if (this.state.shouldgo) {
            return (
                <div>
                    <Tag color="#108ee9"><CjIcon />CronJob {store.currentElement.metadata.name}</Tag>
                    <Tabs defaultActiveKey="1" tabBarExtraContent={operations}>
                        <TabPane tab="Summary" key="1">
                            <CjSummary />
                        </TabPane>
                        <TabPane tab="Metadata" key="2">
                            <Metadata info={store.currentElement} />
                        </TabPane>
                        <TabPane tab="Yaml" key="3">
                            <CjYaml />
                        </TabPane>
                    </Tabs>
                </div>
            )
        } else {
            return <div></div>
        }
    }
}

export { CjTabs }

