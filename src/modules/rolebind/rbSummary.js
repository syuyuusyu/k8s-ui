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
import '../codeMirrorStyle.css';


@inject('rootStore')
@observer
class RbConfiguration extends Component {

    render() {
        const store = this.props.rootStore.store('rb')
        const ele = toJS(store.currentElement)
        const rkind = ele.roleRef.kind
        const sname = this.props.rootStore.shortName(rkind)
        const rname = ele.roleRef.name
        return (
            <div>
                <Descriptions title="Info" size={'small'} bordered>
                    <Descriptions.Item label="Role kind" span={3}>{ele.roleRef.kind}</Descriptions.Item>
                    <Descriptions.Item label="Role name" span={3}>
                        <Tag color="success" > <Link to={`/k8s/${sname}/detail`} onClick={() => { this.rootStore.menuStore.goto(sname, rname) }}>{rname}</Link></Tag >
                    </Descriptions.Item>
                </Descriptions>
                <span>Subjects</span>
                <Table
                    columns={[
                        {
                            dataIndex: 'kind', title: 'Kind', width: 200,
                        },
                        { dataIndex: 'name', title: 'Name', width: 200, },
                        { dataIndex: 'namespaces', title: 'Namespace', }
                    ]}
                    rowKey={record => Math.random().toString().substr(2, 10)}
                    dataSource={ele.subjects}
                    size="small"
                />
            </div>
        )
    }
}





@inject('rootStore')
@observer
class RbSummary extends Component {
    componentDidMount() {

    }


    render() {
        return (
            <div>
                <RbConfiguration />
            </div>
        )
    }
}

@inject('rootStore')
@observer
class RbYaml extends Component {
    componentDidMount() {
        const store = this.props.rootStore.store('rb')
        store.yamlCurrent = store.yamlText
    }
    render() {
        const store = this.props.rootStore.store('rb')
        return (

            <div className={'pod'}>
                <Row>
                    <Col><Button onClick={store.update}>更新</Button></Col>
                </Row>
                <CodeMirror
                    style={{ height: '700px', paddingBottom: '20px' }}
                    value={store.yamlText}
                    options={
                        {
                            mode: 'yaml',
                            theme: 'material',
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
class RbTabs extends Component {
    state = {}
    static getDerivedStateFromProps(props, state) {
        const store = props.rootStore.store('rb')
        console.log(toJS(store.currentElement));
        if (!toJS(store.currentElement)) {
            //props.history.push('/k8s/deploy');
            return { shouldgo: false }
        }
        return { shouldgo: true }
    }

    render() {
        const store = this.props.rootStore.store('rb')
        const operations = <Popconfirm title="确定删除？" onConfirm={store.delete}><Button >删除</Button></Popconfirm>;
        if (this.state.shouldgo) {
            return (
                <div>
                    <Tag color="#108ee9">Role {store.currentElement.metadata.name}</Tag>
                    <Tabs defaultActiveKey="1" tabBarExtraContent={operations}>
                        <TabPane tab="Summary" key="1">
                            <RbSummary />
                        </TabPane>
                        <TabPane tab="Metadata" key="2">
                            <Metadata info={store.currentElement} />
                        </TabPane>
                        <TabPane tab="Yaml" key="3">
                            <RbYaml />
                        </TabPane>
                    </Tabs>
                </div>
            )
        } else {
            return <div></div>
        }
    }
}

export { RbTabs }

