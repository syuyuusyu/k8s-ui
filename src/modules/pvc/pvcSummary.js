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
class PvcConfiguration extends Component {

    render() {
        const store = this.props.rootStore.store('pvc')
        const ele = toJS(store.currentElement)

        return (
            <div>
                <Descriptions title="Info" size={'small'} bordered>
                    {
                        ele.spec.volumeMode ?
                            <Descriptions.Item label="Volume Mode" span={3}>{ele.spec.volumeMode}</Descriptions.Item>
                            : ''
                    }
                    {
                        ele.spec.accessModes ?
                            <Descriptions.Item label="Access Mode" span={3}>{ele.spec.accessModes.join(',')}</Descriptions.Item>
                            : ''
                    }
                    {
                        ele.metadata.finalizers ?
                            <Descriptions.Item label="Finalizers" span={3}>{ele.metadata.finalizers.join(',')}</Descriptions.Item>
                            : ''
                    }
                    {
                        ele.spec.storageClassName ?
                            <Descriptions.Item label="Storage Class Name" span={3}>{ele.spec.storageClassName}</Descriptions.Item>
                            : ''
                    }
                </Descriptions>
                <Descriptions title="Status" size={'small'} bordered>
                    {
                        ele.status.phase ?
                            <Descriptions.Item label="Claim Status" span={3}>{ele.status.phase}</Descriptions.Item>
                            : ''
                    }
                    {
                        ele.spec.resources.requests && ele.spec.resources.requests.storage ?
                            <Descriptions.Item label="Storage Requested" span={3}>{ele.spec.resources.requests.storage}</Descriptions.Item>
                            : ''
                    }
                    {
                        ele.spec.volumeName ?
                            <Descriptions.Item label="Bound Volume" span={3}>
                                {
                                    this.props.rootStore.list('pv').filter(pv => pv.metadata.name === ele.spec.volumeName).map(pv =>
                                        <Tag color="success"><Link to={`/k8s/pv/detail`} onClick={() => { this.props.rootStore.menuStore.goto('pv', pv.metadata.name) }}>{pv.metadata.name}</Link></Tag>
                                    )
                                }
                            </Descriptions.Item>
                            : ''
                    }
                    {
                        ele.status.capacity && ele.status.capacity.storage ?
                            <Descriptions.Item label="Total Volume Capacity" span={3}>{ele.status.capacity.storage}</Descriptions.Item>
                            : ''
                    }
                </Descriptions>
            </div>
        )
    }
}





@inject('rootStore')
@observer
class PvcSummary extends Component {
    componentDidMount() {

    }
    filterFun = (pod) => {
        if (!pod.metadata.ownerReferences) {
            return false
        }
        const pvc = this.props.rootStore.element('pvc')
        let vol = pod.spec.volumes.find(v => v.persistentVolumeClaim)
        if (!vol) {
            return false
        } else {
            return vol.claimName = pvc.metadata.name
        }

    }

    render() {
        return (
            <div>
                <PvcConfiguration />
                <span>Pods</span>
                <PodTable filterFun={this.filterFun} />
            </div>
        )
    }
}

@inject('rootStore')
@observer
class PvcYaml extends Component {
    componentDidMount() {
        const store = this.props.rootStore.store('pvc')
        store.yamlCurrent = store.yamlText
    }
    render() {
        const store = this.props.rootStore.store('pvc')
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
class PvcTabs extends Component {
    state = {}
    static getDerivedStateFromProps(props, state) {
        const store = props.rootStore.store('pvc')
        console.log(toJS(store.currentElement));
        if (!toJS(store.currentElement)) {
            //props.history.push('/k8s/deploy');
            return { shouldgo: false }
        }
        return { shouldgo: true }
    }

    render() {
        const store = this.props.rootStore.store('pvc')
        const operations = <Popconfirm title="确定删除？" onConfirm={store.delete}><Button danger>删除</Button></Popconfirm>;
        if (this.state.shouldgo) {
            return (
                <div>
                    <Tag color="#108ee9" style={{ height: 32, width: 'auto', fontSize: 24, paddingTop: 4 }}>PersistentVolumeClaim {store.currentElement.metadata.name}</Tag>
                    <Tabs defaultActiveKey="1" tabBarExtraContent={operations}>
                        <TabPane tab="Summary" key="1">
                            <PvcSummary />
                        </TabPane>
                        <TabPane tab="Metadata" key="2">
                            <Metadata info={store.currentElement} />
                        </TabPane>
                        <TabPane tab="Yaml" key="3">
                            <PvcYaml />
                        </TabPane>
                    </Tabs>
                </div>
            )
        } else {
            return <div></div>
        }
    }
}

export { PvcTabs }

