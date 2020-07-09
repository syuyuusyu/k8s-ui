import { observable, configure, action, runInAction, computed, toJS } from 'mobx';
import { inject, observer } from 'mobx-react';
import React, { Component } from 'react';
import { Tag, message, notification, Tooltip, Alert, Row, Col, Button, Tabs } from 'antd'
const { TabPane } = Tabs;
import YAML from 'yaml';
import { Link, } from 'react-router-dom';
import { nsUrl, host } from '../config/api'
import { get, post } from '../config/util'

import { Pos } from 'codemirror';
//import {UnControlled as CodeMirror} from 'react-codemirror2'

import { UnControlled as CodeMirror } from 'react-codemirror2'
import 'codemirror/mode/yaml/yaml'
import 'codemirror/mode/javascript/javascript';

import 'codemirror/addon/hint/show-hint.css';
import 'codemirror/addon/hint/show-hint.js';

import 'codemirror/addon/hint/anyword-hint.js';

import 'codemirror/addon/search/searchcursor'

import 'codemirror/lib/codemirror.css';
import 'codemirror/lib/codemirror.css';
import 'codemirror/theme/idea.css';
import './codeMirrorStyle.css';

Array.prototype.valuehint = function () {
    return this.map(k => ({ displayText: k, text: ': ' + k }))
}
Array.prototype.contain = function (o, id) {
    return this.find(_ => id ? _[id] == o[id] : _ == o)
}

class CreateStore {
    constructor(rootStore) {
        this.rootStore = rootStore;
        //this.loadRegistryImages()
        this.loadDefinitions()
        //console.log(111)
    }

    hintOpen = true

    yamlCurrent = ''
    kindList = ['Pod', 'Deployment', 'ReplicaSet', 'DaemonSet', 'StatefulSet', 'ReplicationController', 'Job', 'CronJob',
        'ConfigMap', 'PersistentVolumeClaim', 'PersistentVolume', 'Secret', 'ServiceAccount', 'Service', 'Ingress', 'HorizontalPodAutoscaler',
        'Role', 'RoleBinding', 'ClusterRole', 'ClusterRoleBinding']
    get first() {
        return ['Kind: ', `apiVersion: ${this.apiVersion}`, 'metadata:', 'spec:']
    }

    yamlJson = []

    registryImages = []
    apiDefinitions = {}

    get ckind() {
        let v = ''
        this.yamlCurrent.replace(/Kind:\s(\w+)/, (w, p) => v = p)
        if (v) {
            if (this.kindList.contain(v)) {
                return v
            } else {
                message.error(`无效的类型${v}`);
            }
        }
        return ''
    }

    get kindDef() {
        if (!this.ckind) {
            return {}
        }
        let key = Object.keys(this.apiDefinitions).find(_ => _.endsWith('.' + this.ckind))
        return this.apiDefinitions[key]
    }

    get apiVersion() {
        if (!this.ckind) {
            return ''
        }
        return this.kindDef['x-kubernetes-group-version-kind'][0].version
    }

    loadRegistryImages = async () => {
        let json = await get(`${host}/registry/images`)
        this.registryImages = json
    }

    loadDefinitions = async () => {
        //let json = await get(`${host}/kube/api/definitions`)
        //this.apiDefinitions = def
    }

    valideCode = (edit) => {
        try {
            const docarr = YAML.parseAllDocuments(this.yamlCurrent)
            this.yamlJson = []
            docarr.forEach(d => this.yamlJson.push(d.toJSON()))
            //this.yamlJson = YAML.parse(this.yamlCurrent);
            if (edit) {
                let json = this.yamlJson.map((j, i) => (i > 0 ? '---\n' : '') + YAML.stringify(j)).reduce((a, b) => a + b)

                edit.setValue(json);
                this.yamlCurrent = YAML.stringify(json);
            }

            return true;
        } catch (e) {
            message.error(e.toLocaleString());
            return false;
        }
    };

    currentHintList = []

    handleShowHint = (edit) => {
        let { line, start, end, lineStr, key, value, level } = this.context(edit)
        this.handleHintList(line, start, end, lineStr, key, value, level)

        let list = this.currentHintList
        return { list, from: Pos(line, start), to: Pos(line, end) };
    }

    handleHintList = (line, start, end, lineStr, key, value, level) => {
        if (level == 0) {
            if (key == 'Kind') {
                this.currentHintList = this.kindList.valuehint()
                return
            }
            console.log(this.first)
            this.currentHintList = this.first
            return
        }

        this.currentHintList = []
    }



    context = (edit) => {
        const cursor = edit.getCursor()
        const token = edit.getTokenAt(cursor)
        const start = token.start
        const end = cursor.ch
        const line = cursor.line
        const lineStr = edit.doc.getLine(line)
        console.log("'" + lineStr + "'")
        let arr = lineStr.split(': ')
        let level = 0
        let key = arr[0], value = arr[1]
        key.split('').forEach(_ => {
            if (_ != ' ') {
                return
            } else {
                level++
            }
        })
        level = level / 2
        key = key.trim()
        if (value) value = value.trim()
        //const currentWord = token.string
        return { line, start, end, lineStr, key, value, level }
    }

    onEditor = (editor, data, value) => {
        this.yamlCurrent = value;
    }

    filterHintList = (value) => {
        const regExp = new RegExp(`.*${value}.*`, 'i');
        const filtered = this.state.invokeNames.filter((o) => regExp.test(o.name));

    };

    save = () => {
        if (!this.valideCode()) return
        const ns = this.rootStore.columnStore.currentNamespace
        this.yamlJson.forEach(async (v) => {
            let kind = v.kind
            let name = v.metadata.name
            let json = await post(`${host}/kube/namespace/${ns}/${kind}`, v)
            if (json.success) {
                notification.info({
                    message: `${kind} ${name}新建成功`
                })
            } else {
                notification.error({
                    message: json.msg
                })
            }


        })
    }


}




@inject('rootStore')
@observer
class CreateYaml extends Component {
    componentDidMount() {
        this.codeEditor = this.codeEditorRef.editor;
    }


    render() {
        const store = this.props.rootStore.createStore

        return (
            <div className={'pod'}>
                <CodeMirror
                    ref={ref => this.codeEditorRef = ref}
                    style={{ height: '700px', paddingBottom: '20px' }}
                    value={''}
                    options={
                        {
                            mode: 'yaml',
                            theme: 'idea',
                            lineNumbers: true,
                            //hintOptions: { hint: store.handleShowHint, completeSingle: false },
                            lineWrapping: true,
                            extraKeys: {
                                // 'Ctrl': (edit) => {
                                //     store.hintOpen = !store.hintOpen
                                //     if (!store.hintOpen) {
                                //         edit.showHint({
                                //             completeSingle: false,
                                //             alignWithWord: false,
                                //             hint: store.handleShowHint
                                //         })
                                //     } else {
                                //         edit.closeHint()
                                //     }
                                // },
                                'Ctrl-F': (edit) => {
                                    store.valideCode(edit)
                                },
                            },
                        }
                    }

                    onChange={store.onEditor}
                />
            </div>
        )
    }
}



@inject('rootStore')
@observer
class CreateTab extends Component {

    render() {
        const store = this.props.rootStore.createStore
        const operations = <Button onClick={store.save} >提交</Button>;
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
