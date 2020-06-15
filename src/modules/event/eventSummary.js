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

import { Controlled as CodeMirror } from 'react-codemirror2'
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
class EventConfiguration extends Component {
    // Event Detail
    // Last Seen	4m
    // First Seen	6d
    // Count	19221
    // Message	No matching pods found
    // Kind	PodDisruptionBudget
    // Type	Normal
    // Reason	NoPods
    // Source	controllermanager


    render() {
        const store = this.props.rootStore.store('event')
        const ele = toJS(store.currentElement)
        return (
            <div>
                <Descriptions title="Event Detail" size={'small'} bordered>
                    <Descriptions.Item label="First Seen" span={3} >{this.props.rootStore.columnStore._calculateAge(ele.lastTimestamp)}</Descriptions.Item>
                    <Descriptions.Item label="Last Seen" span={3} >{this.props.rootStore.columnStore._calculateAge(ele.firstTimestamp)}</Descriptions.Item>
                    <Descriptions.Item label="Count" span={3} >{ele.count}</Descriptions.Item>
                    <Descriptions.Item label="Message" span={3} >{ele.message}</Descriptions.Item>
                    <Descriptions.Item label="Kind" span={3} >{ele.involvedObject.kind}</Descriptions.Item>
                    <Descriptions.Item label="Type" span={3} >{ele.type}</Descriptions.Item>
                    <Descriptions.Item label="Reason" span={3} >{ele.reason}</Descriptions.Item>
                    <Descriptions.Item label="Source" span={3} >{ele.source.component}</Descriptions.Item>
                </Descriptions>
            </div>
        )
    }
}





@inject('rootStore')
@observer
class EventSummary extends Component {


    render() {
        return (
            <div>
                <EventConfiguration />
            </div>
        )
    }
}

@inject('rootStore')
@observer
class EventYaml extends Component {
    componentDidMount() {
        const store = this.props.rootStore.store('event')
        store.yamlCurrent = store.yamlText
    }
    render() {
        const store = this.props.rootStore.store('event')
        return (

            <div className={'pod'}>

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
                // onChange={(editor, data, value) => {
                //     store.yamlCurrent = value;
                // }}
                />
            </div>
        )
    }
}

@inject('rootStore')
@observer
class EventTabs extends Component {
    state = {}
    static getDerivedStateFromProps(props, state) {
        const store = props.rootStore.store('event')
        console.log(toJS(store.currentElement));
        if (!toJS(store.currentElement)) {
            //props.history.push('/k8s/deploy');
            return { shouldgo: false }
        }
        return { shouldgo: true }
    }

    render() {
        const store = this.props.rootStore.store('event')
        //const operations = <Popconfirm title="确定删除？" onConfirm={store.delete}><Button >删除</Button></Popconfirm>;
        if (this.state.shouldgo) {
            return (
                <div>
                    <Tag color="#108ee9">Event {store.currentElement.metadata.name}</Tag>
                    <Tabs defaultActiveKey="1" >
                        <TabPane tab="Summary" key="1">
                            <EventSummary />
                        </TabPane>
                        <TabPane tab="Metadata" key="2">
                            <Metadata info={store.currentElement} />
                        </TabPane>
                        <TabPane tab="Yaml" key="3">
                            <EventYaml />
                        </TabPane>
                    </Tabs>
                </div>
            )
        } else {
            return <div></div>
        }
    }
}

export { EventTabs }

