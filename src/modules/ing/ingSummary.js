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
class IngConfiguration extends Component {

    columns = [
        {
            dataIndex: 'host', title: 'Host', width: 100,
        },
        {
            dataIndex: 'path', title: 'Path', width: 200,
        },
        {
            dataIndex: 'end', title: 'Backends', width: 300,
        },
    ]

    list = (roles) => {
        let arr = []
        roles.forEach(r => {
            r.http.paths.forEach(p => {
                arr.push({
                    host: r.host, path: p.path,
                    end: < Tag color="success" > <Link to={`/k8s/svc/detail`} onClick={() => { this.props.rootStore.menuStore.goto('svc', p.backend.serviceName) }}>{p.backend.serviceName + ':' + p.backend.servicePort}</Link></Tag>
                })
            })
        });
        return arr
    }

    render() {
        const store = this.props.rootStore.store('ing')
        const ele = toJS(store.currentElement)
        return (
            <div>
                <Table
                    columns={this.columns}
                    rowKey={_ => Math.random().toString().substr(2, 10)}
                    dataSource={this.list(ele.spec.rules)}
                    size="small"
                />
            </div>
        )
    }
}





@inject('rootStore')
@observer
class IngSummary extends Component {


    render() {
        return (
            <div>
                <IngConfiguration />
            </div>
        )
    }
}

@inject('rootStore')
@observer
class IngYaml extends Component {
    componentDidMount() {
        const store = this.props.rootStore.store('ing')
        store.yamlCurrent = store.yamlText
    }
    render() {
        const store = this.props.rootStore.store('ing')
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
class IngTabs extends Component {
    state = {}
    static getDerivedStateFromProps(props, state) {
        const store = props.rootStore.store('ing')
        console.log(toJS(store.currentElement));
        if (!toJS(store.currentElement)) {
            //props.history.push('/k8s/deploy');
            return { shouldgo: false }
        }
        return { shouldgo: true }
    }

    render() {
        const store = this.props.rootStore.store('ing')
        const operations = <Popconfirm title="确定删除？" onConfirm={store.delete}><Button >删除</Button></Popconfirm>;
        if (this.state.shouldgo) {
            return (
                <div>
                    <Tag color="#108ee9">Ingress {store.currentElement.metadata.name}</Tag>
                    <Tabs defaultActiveKey="1" tabBarExtraContent={operations}>
                        <TabPane tab="Summary" key="1">
                            <IngSummary />
                        </TabPane>
                        <TabPane tab="Metadata" key="2">
                            <Metadata info={store.currentElement} />
                        </TabPane>
                        <TabPane tab="Yaml" key="3">
                            <IngYaml />
                        </TabPane>
                    </Tabs>
                </div>
            )
        } else {
            return <div></div>
        }
    }
}

export { IngTabs }

