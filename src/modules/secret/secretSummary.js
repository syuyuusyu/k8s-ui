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
class SecretConfiguration extends Component {

    render() {
        const store = this.props.rootStore.store('pv')
        const ele = toJS(store.currentElement)

        return (
            <div>
                <Descriptions title="Info" size={'small'} bordered>
                    {
                        ele.spec.persistentVolumeReclaimPolicy ?
                            <Descriptions.Item label="Reclaim Policy" span={3}>{ele.spec.persistentVolumeReclaimPolicy}</Descriptions.Item>
                            : ''
                    }
                    {
                        ele.spec.storageClassName ?
                            <Descriptions.Item label="Storage Class" span={3}>{ele.spec.storageClassName}</Descriptions.Item>
                            : ''
                    }
                    {
                        ele.spec.capacity.storage ?
                            <Descriptions.Item label="Capacity" span={3}>{ele.spec.capacity.storage}</Descriptions.Item>
                            : ''
                    }
                    {
                        ele.spec.nfs ?
                            <Descriptions.Item label="NfS" span={3}>
                                {
                                    JSON.stringify(ele.spec.nfs)
                                }

                            </Descriptions.Item>
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
                        ele.spec.claimRef ?
                            <Descriptions.Item label="Claim" span={3}>
                                <Tag color="success"><Link to={`/k8s/pvc/detail`} onClick={() => { this.props.rootStore.menuStore.goto('pvc', ele.spec.claimRef.name, ele.spec.claimRef.namespace) }}>{ele.spec.claimRef.name}</Link></Tag>
                            </Descriptions.Item>
                            : ''
                    }

                </Descriptions>
            </div>
        )
    }
}





@inject('rootStore')
@observer
class SecretSummary extends Component {
    componentDidMount() {

    }


    render() {
        return (
            <div>
                <SecretConfiguration />
            </div>
        )
    }
}

@inject('rootStore')
@observer
class SecretYaml extends Component {
    componentDidMount() {
        const store = this.props.rootStore.store('secret')
        store.yamlCurrent = store.yamlText
    }
    render() {
        const store = this.props.rootStore.store('secret')
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
class SecretTabs extends Component {
    state = {}
    static getDerivedStateFromProps(props, state) {
        const store = props.rootStore.store('secret')
        console.log(toJS(store.currentElement));
        if (!toJS(store.currentElement)) {
            //props.history.push('/k8s/deploy');
            return { shouldgo: false }
        }
        return { shouldgo: true }
    }

    render() {
        const store = this.props.rootStore.store('secret')
        const operations = <Popconfirm title="确定删除？" onConfirm={store.delete}><Button >删除</Button></Popconfirm>;
        if (this.state.shouldgo) {
            return (
                <div>
                    <Tag color="#108ee9">Secret {store.currentElement.metadata.name}</Tag>
                    <Tabs defaultActiveKey="1" tabBarExtraContent={operations}>
                        {/* <TabPane tab="Summary" key="1">
                            <SecretSummary />
                        </TabPane> */}
                        <TabPane tab="Metadata" key="2">
                            <Metadata info={store.currentElement} />
                        </TabPane>
                        <TabPane tab="Yaml" key="3">
                            <SecretYaml />
                        </TabPane>
                    </Tabs>
                </div>
            )
        } else {
            return <div></div>
        }
    }
}

export { SecretTabs }

