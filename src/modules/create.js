import { observable, configure, action, runInAction, computed, toJS } from 'mobx';
import { inject, observer } from 'mobx-react';
import React, { Component } from 'react';
import { Tag, Popover, Badge, Tooltip, Alert, Row, Col, Button, Tabs } from 'antd'
const { TabPane } = Tabs;
import { Link, } from 'react-router-dom';
import { EventSourcePolyfill } from 'event-source-polyfill';
import { nsUrl, host } from '../config/api'
import { get } from '../config/util'

import { UnControlled as CodeMirror } from 'react-codemirror2'
import 'codemirror/mode/yaml/yaml';
import 'codemirror/mode/javascript/javascript';
import 'codemirror/addon/hint/show-hint.css';
import 'codemirror/addon/hint/show-hint.js';
import 'codemirror/addon/hint/javascript-hint.js'

import 'codemirror/lib/codemirror.css';
import 'codemirror/theme/material.css';
import 'codemirror/theme/ambiance.css';
import 'codemirror/theme/idea.css';
import './codeMirrorStyle.css';

class CreateStore {
    constructor(rootStore) {
        this.rootStore = rootStore;
    }

    yamlCurrent = ''
    yamlJson = {}

    dosome = () => { }

    valideCode = () => {
        try {
            this.yamlJson = YAML.parse(this.yamlCurrent);
            return true;
        } catch (e) {
            notification.error({
                message: e.toLocaleString()
            });
            return false;
        }
        this.dosome({
            completeSingle: false,
            // closeOnUnfocus: false,  // for debug
            hint: () => {
                return {
                    list: [1, 2, 3, 4, 5],
                    from: null,
                    to: null,
                };
            },
        })
    };


}

@inject('rootStore')
@observer
class CreateYaml extends Component {
    componentDidMount() {
        const store = this.props.rootStore.createStore
    }

    render() {
        const store = this.props.rootStore.createStore
        return (
            <div className={'pod'}>

                <CodeMirror
                    style={{ height: '700px', paddingBottom: '20px' }}
                    value={''}
                    options={
                        {
                            mode: 'javascript',
                            theme: 'idea',
                            lineNumbers: true,
                            extraKeys: {

                                'Ctrl-Q': (cm) => {

                                    CodeMirror.commands.autocomplete(cm, null, { completeSingle: false });
                                },
                            },
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
class CreateTab extends Component {

    render() {

        const operations = <Button >提交</Button>;
        return (
            <div>

                <Tabs defaultActiveKey="1" tabBarExtraContent={operations}>
                    <TabPane tab="Yaml" key="1">
                        <CreateYaml />
                    </TabPane>

                </Tabs>
            </div>
        )
    }
}

export { CreateTab, CreateStore }