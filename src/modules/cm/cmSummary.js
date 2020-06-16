
import React, { Component } from 'react';
import {
    Modal, Badge, Icon, Input, Table, Dropdown, Menu, Button, Divider, Popconfirm, Descriptions, Tabs, Tag, Row, Col, notification
} from 'antd';
import { Link } from 'react-router-dom';
const { TabPane } = Tabs;
import { inject, observer } from 'mobx-react';
import { toJS } from 'mobx';
import { Conditions, Metadata } from '../common'
import { PodTable } from '../pod'
import { host } from '../../config/api'
import { put, del } from '../../config/util'

import { UnControlled as CodeMirror } from 'react-codemirror2'
import 'codemirror/mode/yaml/yaml';
import 'codemirror/mode/javascript/javascript';
import 'codemirror/addon/hint/show-hint.css';
import 'codemirror/addon/hint/show-hint.js';

import 'codemirror/lib/codemirror.css';
import 'codemirror/theme/material.css';
import 'codemirror/theme/ambiance.css';
import '../codeMirrorStyle.css';

import { CmIcon } from '../../config/icon'



@inject('rootStore')
@observer
class Yaml extends Component {
    componentDidMount() {
        const store = this.props.rootStore.cmStore
        store.yamlCurrent = store.yamlText
    }
    render() {
        const store = this.props.rootStore.cmStore
        console.log('yaml render')
        return (

            <div className={'pod'}>
                <span style={{ display: 'none' }}>{store.yamlText}</span>
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
class DataYaml extends Component {
    componentDidMount() {
        const store = this.props.rootStore.cmStore
        this.currentData = store.currentData
    }
    currentData

    updateDate = async () => {
        const store = this.props.rootStore.store('cm')
        const key = store.dataName
        const { namespace: ns, name } = store.currentElement.metadata
        let json = await put(`${host}/kube/addConfigMapData`, { name, ns, key, context: this.currentData })
        notification[json.success ? 'info' : 'error']({
            message: json.msg
        })
    }
    render() {
        const store = this.props.rootStore.cmStore

        return (

            <div className={'pod'}>
                <Row>
                    <Col><Button onClick={this.updateDate}>更新</Button></Col>
                </Row>
                <CodeMirror
                    style={{ height: '700px', paddingBottom: '20px' }}
                    value={store.currentData}
                    options={
                        {
                            mode: 'yaml',
                            theme: 'material',
                            lineNumbers: true
                        }
                    }
                    onChange={(editor, data, value) => {
                        this.currentData = value;
                    }}
                />
            </div>
        )
    }
}

@inject('rootStore')
@observer
class CmTabs extends Component {
    state = {}
    static getDerivedStateFromProps(props, state) {
        const ele = props.rootStore.element('cm')
        if (!ele) {
            //props.history.push('/k8s/deploy');
            return { shouldgo: false }
        }
        return { shouldgo: true }
    }

    showModal = () => {
        this.setState({
            visible: true,
        });
    };

    handleOk = async e => {
        const key = document.getElementById('addKey').value
        const { name, namespace } = this.props.rootStore.element('cm').metadata
        let json = await put(`${host}/kube/addConfigMapData`, { name, ns: namespace, key, context: '' })
        notification[json.success ? 'info' : 'error']({
            message: json.msg
        })
        this.setState({
            visible: false,
        });
    };

    handleCancel = e => {
        this.setState({
            visible: false,
            deletconfirmvisible: false
        });
    };

    onEdit = (targetKey, action) => {
        console.log(targetKey, action)
        if (action === 'add') {
            this.showModal()
        }
        if (action === 'remove') {
            const store = this.props.rootStore.store('cm')
            store.setDataName(targetKey)
            this.setState({ deletconfirmvisible: true })
        }
    }

    changeTab = key => {
        const store = this.props.rootStore.store('cm')
        if (key == 1) {
            store.setDataName('')
        } else {
            store.setDataName(key)
        }
    }

    handldelete = async () => {
        // /namespace/{ns}/daleteConfigMapData/{name}/{key}
        const store = this.props.rootStore.store('cm')
        const key = store.dataName
        const { namespace: ns, name } = store.currentElement.metadata
        let json = await del(`${host}/kube/namespace/${ns}/daleteConfigMapData/${name}/${key}`)
        notification[json.success ? 'info' : 'error']({
            message: json.msg
        })
        this.setState({
            deletconfirmvisible: false,
        });
    }

    render() {
        const store = this.props.rootStore.store('cm')
        const operations = <span><Popconfirm title="确定删除？" onConfirm={store.delete}><Button >删除</Button></Popconfirm></span>;
        if (this.state.shouldgo) {
            return (
                <div>
                    <Modal
                        key='addData'
                        title="新增字段"
                        visible={this.state.visible}
                        onOk={this.handleOk}
                        onCancel={this.handleCancel}
                    >
                        <Input id="addKey" onChange={this.inputChange} />
                    </Modal>
                    <Modal
                        key='deletconfirm'
                        visible={this.state.deletconfirmvisible}
                        onOk={this.handldelete}
                        onCancel={this.handleCancel}
                    >
                        <span>{`确认删除字段 ${store.dataName} ?`}</span>
                    </Modal>
                    <Tag color="#108ee9"><CmIcon />ConfigMap {store.currentElement.metadata.name}</Tag>
                    <Tabs defaultActiveKey="1"
                        tabBarExtraContent={operations}
                        type="editable-card"
                        tabPosition="top"
                        onEdit={this.onEdit}
                        //tabBarGutter={8}
                        onChange={this.changeTab}
                    >
                        <TabPane tab="Summary" key="1" closable={false} >
                            <Yaml />
                        </TabPane>
                        {
                            store.dataNamelist.map(key =>
                                <TabPane tab={key} key={key} closable={true}>
                                    <DataYaml />
                                </TabPane>)
                        }
                    </Tabs>
                </div>
            )
        } else {
            return <div></div>
        }
    }
}

export { CmTabs }

