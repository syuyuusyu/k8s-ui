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
class SaConfiguration extends Component {

    render() {
        const store = this.props.rootStore.store('sa')
        const ele = toJS(store.currentElement)

        return (
            <div>
                <Descriptions title="Info" size={'small'} bordered>
                    {
                        ele.secrets ?
                            <Descriptions.Item label="Mountable Secrets" span={3}>
                                {
                                    ele.secrets.map(s =>
                                        <Tag key={s.name} color="success"><Link to={`/k8s/secret/detail`} onClick={() => { this.props.rootStore.menuStore.goto('secret', s.name) }}>{s.name}</Link></Tag>
                                    )
                                }

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
class SaSummary extends Component {
    componentDidMount() {

    }


    render() {
        return (
            <div>
                <SaConfiguration />
            </div>
        )
    }
}

@inject('rootStore')
@observer
class SaYaml extends Component {
    componentDidMount() {
        const store = this.props.rootStore.store('sa')
        store.yamlCurrent = store.yamlText
    }
    render() {
        const store = this.props.rootStore.store('sa')
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
class SaTabs extends Component {
    state = {}
    static getDerivedStateFromProps(props, state) {
        const store = props.rootStore.store('sa')
        console.log(toJS(store.currentElement));
        if (!toJS(store.currentElement)) {
            //props.history.push('/k8s/deploy');
            return { shouldgo: false }
        }
        return { shouldgo: true }
    }

    render() {
        const store = this.props.rootStore.store('sa')
        const operations = <Popconfirm title="确定删除？" onConfirm={store.delete}><Button danger>删除</Button></Popconfirm>;
        if (this.state.shouldgo) {
            return (
                <div>
                    <Tag color="#108ee9" style={{ height: 32, width: 'auto', fontSize: 24, paddingTop: 4 }}>PersistentVolume {store.currentElement.metadata.name}</Tag>
                    <Tabs defaultActiveKey="1" tabBarExtraContent={operations}>
                        <TabPane tab="Summary" key="1">
                            <SaSummary />
                        </TabPane>
                        <TabPane tab="Metadata" key="2">
                            <Metadata info={store.currentElement} />
                        </TabPane>
                        <TabPane tab="Yaml" key="3">
                            <SaYaml />
                        </TabPane>
                    </Tabs>
                </div>
            )
        } else {
            return <div></div>
        }
    }
}

export { SaTabs }

