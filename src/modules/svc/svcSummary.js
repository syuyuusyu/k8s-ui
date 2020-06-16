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
class SvcConfiguration extends Component {

    render() {
        const store = this.props.rootStore.store('svc')
        const ele = toJS(store.currentElement)
        console.log(ele)
        return (
            <div>
                <Descriptions title="Info" size={'small'} bordered>
                    <Descriptions.Item label="Selectors" span={3}>{
                        Object.keys(ele.spec.selector).map(key => key + ':' + ele.spec.selector[key]).join(',')
                    }</Descriptions.Item>
                    <Descriptions.Item label="Type" span={3}>{ele.spec.type}</Descriptions.Item>
                    <Descriptions.Item label="Ports" span={3}>{
                        ele.spec.ports.map(p => `${p.port}${p.nodePort ? ':' + p.nodePort : ''}/${p.protocol}->${p.targetPort}`).join(',')
                    }</Descriptions.Item>
                    <Descriptions.Item label="Cluster IP" span={3}>{ele.spec.clusterIP}</Descriptions.Item>
                    <Descriptions.Item label="External IPs" span={3}>{ele.spec.externalIPs}</Descriptions.Item>
                </Descriptions>

            </div>
        )
    }
}





@inject('rootStore')
@observer
class SvcSummary extends Component {
    filterFun = (pod) => {
        const selector = this.props.rootStore.element('svc').spec.selector
        let labels = pod.metadata.labels
        let flag = false
        if (!labels) return flag
        for (let key in labels) {
            if (selector[key] && selector[key] === labels[key]) {
                flag = true
            }
        }
        return flag
    }

    render() {
        return (
            <div>
                <SvcConfiguration />
                <span>Pods</span>
                <PodTable filterFun={this.filterFun} />
            </div>
        )
    }
}

@inject('rootStore')
@observer
class SvcYaml extends Component {
    componentDidMount() {
        const store = this.props.rootStore.store('svc')
        store.yamlCurrent = store.yamlText
    }
    render() {
        const store = this.props.rootStore.store('svc')
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
class SvcTabs extends Component {
    state = {}
    static getDerivedStateFromProps(props, state) {
        const store = props.rootStore.store('svc')
        console.log(toJS(store.currentElement));
        if (!toJS(store.currentElement)) {
            //props.history.push('/k8s/deploy');
            return { shouldgo: false }
        }
        return { shouldgo: true }
    }

    render() {
        const store = this.props.rootStore.store('svc')
        const operations = <Popconfirm title="确定删除？" onConfirm={store.delete}><Button >删除</Button></Popconfirm>;
        if (this.state.shouldgo) {
            return (
                <div>
                    <Tag color="#108ee9">PersistentVolume {store.currentElement.metadata.name}</Tag>
                    <Tabs defaultActiveKey="1" tabBarExtraContent={operations}>
                        <TabPane tab="Summary" key="1">
                            <SvcSummary />
                        </TabPane>
                        <TabPane tab="Metadata" key="2">
                            <Metadata info={store.currentElement} />
                        </TabPane>
                        <TabPane tab="Yaml" key="3">
                            <SvcYaml />
                        </TabPane>
                    </Tabs>
                </div>
            )
        } else {
            return <div></div>
        }
    }
}

export { SvcTabs }

