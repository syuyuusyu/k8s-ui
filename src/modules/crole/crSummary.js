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
class CrConfiguration extends Component {

    render() {
        const store = this.props.rootStore.store('cr')
        const ele = toJS(store.currentElement)

        return (
            <div>
                <span>Policy Rules</span>
                <Table
                    columns={[
                        {
                            dataIndex: 'resources', title: 'Resources', width: 200,
                            render: v => v.join(",")
                        },
                        { dataIndex: 'verbs', title: 'Verbs', width: 200, render: v => v.join(",") }
                    ]}
                    rowKey={record => Math.random().toString().substr(2, 10)}
                    dataSource={ele.rules}
                    size="small"
                />
            </div>
        )
    }
}





@inject('rootStore')
@observer
class CrSummary extends Component {
    componentDidMount() {

    }


    render() {
        return (
            <div>
                <CrConfiguration />
            </div>
        )
    }
}

@inject('rootStore')
@observer
class CrYaml extends Component {
    componentDidMount() {
        const store = this.props.rootStore.store('cr')
        store.yamlCurrent = store.yamlText
    }
    render() {
        const store = this.props.rootStore.store('cr')
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
class CrTabs extends Component {
    state = {}
    static getDerivedStateFromProps(props, state) {
        const store = props.rootStore.store('cr')
        console.log(toJS(store.currentElement));
        if (!toJS(store.currentElement)) {
            //props.history.push('/k8s/deploy');
            return { shouldgo: false }
        }
        return { shouldgo: true }
    }

    render() {
        const store = this.props.rootStore.store('cr')
        const operations = <Popconfirm title="确定删除？" onConfirm={store.delete}><Button >删除</Button></Popconfirm>;
        if (this.state.shouldgo) {
            return (
                <div>
                    <Tag color="#108ee9">ClusterRole {store.currentElement.metadata.name}</Tag>
                    <Tabs defaultActiveKey="1" tabBarExtraContent={operations}>
                        <TabPane tab="Summary" key="1">
                            <CrSummary />
                        </TabPane>
                        <TabPane tab="Metadata" key="2">
                            <Metadata info={store.currentElement} />
                        </TabPane>
                        <TabPane tab="Yaml" key="3">
                            <CrYaml />
                        </TabPane>
                    </Tabs>
                </div>
            )
        } else {
            return <div></div>
        }
    }
}

export { CrTabs }

