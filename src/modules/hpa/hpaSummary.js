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
class HpaConfiguration extends Component {



    render() {
        const store = this.props.rootStore.store('hpa')
        const ele = toJS(store.currentElement)
        const short = this.props.rootStore.shortName(ele.spec.scaleTargetRef.kind)
        const refName = ele.spec.scaleTargetRef.name
        return (
            <div>
                <Descriptions title={`Info`} size={'small'} bordered>
                    <Descriptions.Item label="Scale target"><Tag color="success"><a onClick={() => { this.props.rootStore.menuStore.goto(short, refName, null, `/k8s/${short}/detail`) }}>{refName}</a></Tag></Descriptions.Item>
                    <Descriptions.Item label="Min Replicas">{ele.spec.minReplicas}</Descriptions.Item>
                    <Descriptions.Item label="Max Replicas">{ele.spec.maxReplicas}</Descriptions.Item>
                    <Descriptions.Item label="Target CPU Utilization Percentage">{ele.spec.targetCPUUtilizationPercentage}%</Descriptions.Item>
                </Descriptions>
                <Descriptions title={`Status`} size={'small'} bordered>
                    <Descriptions.Item label="Desired Replicas">{ele.status.desiredReplicas}</Descriptions.Item>
                    <Descriptions.Item label="Current Replicas">{ele.status.currentReplicas}</Descriptions.Item>
                    <Descriptions.Item label="CurrentCPU Utilization Percentage">{ele.status.currentCPUUtilizationPercentage}%</Descriptions.Item>
                    <Descriptions.Item label="Last ScaleTime">{ele.status.lastScaleTime}</Descriptions.Item>
                </Descriptions>
            </div>
        )
    }
}





@inject('rootStore')
@observer
class HpaSummary extends Component {


    render() {
        return (
            <div>
                <HpaConfiguration />
            </div>
        )
    }
}

@inject('rootStore')
@observer
class HpaYaml extends Component {
    componentDidMount() {
        const store = this.props.rootStore.store('hpa')
        store.yamlCurrent = store.yamlText
    }
    render() {
        const store = this.props.rootStore.store('hpa')
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
class HpaTabs extends Component {
    state = {}
    static getDerivedStateFromProps(props, state) {
        const store = props.rootStore.store('hpa')
        console.log(toJS(store.currentElement));
        if (!toJS(store.currentElement)) {
            //props.history.push('/k8s/deploy');
            return { shouldgo: false }
        }
        return { shouldgo: true }
    }

    render() {
        const store = this.props.rootStore.store('hpa')
        const operations = <Popconfirm title="确定删除？" onConfirm={store.delete}><Button danger>删除</Button></Popconfirm>;
        if (this.state.shouldgo) {
            return (
                <div>
                    <Tag color="#108ee9" style={{ height: 32, width: 'auto', fontSize: 24, paddingTop: 4 }}>HorizontalPodAutoscaler {store.currentElement.metadata.name}</Tag>
                    <Tabs defaultActiveKey="1" tabBarExtraContent={operations}>
                        <TabPane tab="Summary" key="1">
                            <HpaSummary />
                        </TabPane>
                        <TabPane tab="Metadata" key="2">
                            <Metadata info={store.currentElement} />
                        </TabPane>
                        <TabPane tab="Yaml" key="3">
                            <HpaYaml />
                        </TabPane>
                    </Tabs>
                </div>
            )
        } else {
            return <div></div>
        }
    }
}

export { HpaTabs }

