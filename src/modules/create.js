import { observable, configure, action, runInAction, computed, toJS, reaction } from 'mobx'
import { inject, observer } from 'mobx-react';
import React, { Component } from 'react';
import { Tag, message, notification, Tooltip, Modal, Row, Col, Button, Tabs, Select, Form, Input, InputNumber, Space, Collapse } from 'antd'
import { PlusOutlined, MinusOutlined, QuestionCircleOutlined } from '@ant-design/icons';

import { SubmitIcon } from '../config/icon'

const { TabPane } = Tabs;
const { Option } = Select
const { Panel } = Collapse

import YAML from 'yaml';
import { nsUrl, host, registryUrl } from '../config/api'
import { get, post, isNumber, isBool } from '../config/util'
import { apiDefinitions } from '../../api';

import { Controlled as CodeMirror } from 'react-codemirror2'
//import { UnControlled as CodeMirror } from 'react-codemirror2'

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
import './create.css'
import { sortedLastIndexBy } from 'lodash';


// Object.prototype.forEach = function (fn) {
//     Object.keys(this).forEach(key => fn(key, this[key]));
// }


const additionApi = {
    "pod.ResourceRequirements": {
        "description": "ResourceRequirements describes the compute resource requirements.",
        "type": "object",
        "properties": {
            "requests": {
                "description": "Requests describes the minimum amount of compute resources required. If Requests is omitted for a container, it defaults to Limits if that is explicitly specified, otherwise to an implementation-defined value. More info: https://kubernetes.io/docs/concepts/configuration/manage-compute-resources-container/",
                "additionalProperties": {
                    "$ref": "#/definitions/pod.resource.Quantity"
                },
                "type": "object"
            },
            "limits": {
                "description": "Limits describes the maximum amount of compute resources allowed. More info: https://kubernetes.io/docs/concepts/configuration/manage-compute-resources-container/",
                "additionalProperties": {
                    "$ref": "#/definitions/pod.resource.Quantity"
                },
                "type": "object"
            }
        }
    },
    "pod.resource.Quantity": {
        "description": "When you specify the resource request for Containers in a Pod, the scheduler uses this information to decide which node to place the Pod on. When you specify a resource limit for a Container, the kubelet enforces those limits so that the running container is not allowed to use more of that resource than the limit you set. The kubelet also reserves at least the request amount of that system resource specifically for that container to use.",
        "type": "object",
        "required": [
            "memory", "cpu"
        ],
        "properties": {
            "memory": {
                "description": "Limits and requests for memory are measured in bytes. You can express memory as a plain integer or as a fixed-point number using one of these suffixes: E, P, T, G, M, K. You can also use the power-of-two equivalents: Ei, Pi, Ti, Gi, Mi, Ki. For example, the following represent roughly the same value:128974848, 129e6, 129M, 123Mi",
                "type": "string"
            },
            "cpu": {
                "description": "Limits and requests for CPU resources are measured in cpu units. One cpu, in Kubernetes, is equivalent to 1 vCPU/Core for cloud providers and 1 hyperthread on bare-metal Intel processors.",
                "type": "string"
            },
        }
    },
    "volume.ResourceRequirements": {
        "description": "ResourceRequirements describes the compute resource requirements.",
        "type": "object",
        "properties": {
            "requests": {
                "description": "Requests describes the minimum amount of compute resources required. If Requests is omitted for a container, it defaults to Limits if that is explicitly specified, otherwise to an implementation-defined value. More info: https://kubernetes.io/docs/concepts/configuration/manage-compute-resources-container/",
                "additionalProperties": {
                    "$ref": "#/definitions/volume.resource.Quantity"
                },
                "type": "object"
            },
        }
    },
    "volume.resource.Quantity": {
        "description": "",
        "required": [
            "storage",
        ],
        "properties": {
            "storage": {
                "description": "",
                "type": "string"
            },

        }
    },
    "resourceQuotaSpec.hard.Quantity": {
        "description": "",
        "required": [
            "cpu", "memory", "pods"
        ],
        "properties": {
            "cpu": {
                "description": "Across all pods in a non-terminal state, the sum of CPU  cannot exceed this value.",
                "type": "string"
            },
            "memory": {
                "description": "Across all pods in a non-terminal state, the sum of memory cannot exceed this value.",
                "type": "string"
            },
            "pods": {
                "description": "The total number of pods in a non-terminal state that can exist in the namespace. A pod is in a terminal state if .status.phase in (Failed, Succeeded) is true",
                "type": "string"
            },
        }
    },
    "limitRange.Quantity": {
        "description": "",
        "required": [],
        "properties": {
            "cpu": {
                "description": "",
                "type": "string"
            },
            "memory": {
                "description": "",
                "type": "string"
            },
        }
    }
}

const lightColor = ['#F8F8FF', '#F0F8FF', '#F0FFFF', '#00FF7F', '#FFFFF0', '#FFFAF0']

class CreateStore {
    constructor(rootStore) {
        this.rootStore = rootStore

        //console.log(111)

        reaction(
            () => this.kind,
            () => {
                this.initalTemplateData();
                //this.formInstance.setFieldsValue({ kind: this.templateData.kind, apiVersion: this.templateData.apiVersion })
            }
        )

        reaction(
            () => this.templateData,
            (data) => {
                console.log('---templateData---change')
                this.formInstance.setFieldsValue(data);
            }
        )
    }

    @observable
    templateFormVisible = false

    @action
    toggleTemplateFormVisible = () => this.templateFormVisible = !this.templateFormVisible

    formInstance
    refFormInstance = (instance) => this.formInstance = instance

    @observable
    yamlCurrent = ''
    kindList = ['Pod', 'Deployment', 'ReplicaSet', 'DaemonSet', 'StatefulSet', 'ReplicationController', 'Job', 'CronJob',
        'ConfigMap', 'PersistentVolumeClaim', 'PersistentVolume', 'Secret', 'ServiceAccount', 'Service', 'Ingress', 'HorizontalPodAutoscaler',
        'Role', 'RoleBinding', 'ClusterRole', 'ClusterRoleBinding', 'ResourceQuota', 'LimitRange']

    unCreateDefs = []

    yamlJson = []

    registryImages = []

    apiDefinitions = {}

    @observable
    kind

    @action
    setKind = (v) => {
        this.templateData = {}
        this.kind = v
    }

    kindDef = (kind) => Object.keys(this.apiDefinitions).find(_ => _.endsWith('.' + kind))

    randomKey = () => Math.random().toString().substr(2, 10)

    loadRegistryImages = async () => {
        // let json = await get(`${host}/registry/images?registryUrl=${registryUrl}`)
        // this.registryImages = json
        this.registryImages = []
    }

    loadDefinitions = async () => {
        //let json = await get(`${host}/kube/api/definitions`)
        this.apiDefinitions = await get(`${host}/kube/api/definitions`)
        Object.keys(additionApi).forEach(key => {
            this.apiDefinitions[key] = additionApi[key]
        })

        this.apiDefinitions["io.k8s.api.core.v1.Container"].properties.resources.$ref = '#/definitions/pod.ResourceRequirements'
        this.apiDefinitions["io.k8s.api.core.v1.EphemeralContainer"].properties.resources.$ref = '#/definitions/pod.ResourceRequirements'
        this.apiDefinitions["io.k8s.api.core.v1.PersistentVolumeClaimSpec"].properties.resources.$ref = '#/definitions/volume.ResourceRequirements'
        this.apiDefinitions["io.k8s.api.core.v1.ResourceQuotaSpec"].properties.hard.additionalProperties.$ref = '#/definitions/resourceQuotaSpec.hard.Quantity'

            ;['default', 'min', 'max', 'maxLimitRequestRatio', 'defaultRequest'].forEach(key => {
                this.apiDefinitions["io.k8s.api.core.v1.LimitRangeItem"].properties[key].additionalProperties.$ref = '#/definitions/limitRange.Quantity'
            })

        if (registryUrl) {
            this.apiDefinitions["io.k8s.api.core.v1.Container"].properties.image.selectValue
                = this.registryImages.map(r => `${registryUrl.replace(/http(?:s?):\/\/(\d+.\d+.\d+.\d+:\d+)/, '$1/')}${r}`)
        }

        this.apiDefinitions["io.k8s.api.core.v1.PersistentVolumeClaimVolumeSource"].properties.claimName.selectValue = this.rootStore.nameList('pvc')
        this.apiDefinitions["io.k8s.api.core.v1.ConfigMapVolumeSource"].properties.name.selectValue = this.rootStore.nameList('cm')
    }

    valideCode = (edit) => {
        try {
            if (!this.yamlCurrent) {
                return false
            }
            const docarr = YAML.parseAllDocuments(this.yamlCurrent)
            this.yamlJson = []
            docarr.forEach(d => this.yamlJson.push(d.toJSON()))
            //this.yamlJson = YAML.parse(this.yamlCurrent);
            if (edit) {
                let json = this.yamlJson.map((j, i) => (i > 0 ? '---\n' : '') + YAML.stringify(j)).reduce((a, b) => a + b)
                edit.setValue(json);
                this.yamlCurrent = YAML.stringify(json);
            }
            return true
        } catch (e) {
            message.error(e.toLocaleString())
            return false
        }
    };

    @action
    onEditor = (editor, data, value) => {
        this.yamlCurrent = value
    }

    save = () => {
        if (!this.valideCode()) return
        const ns = this.rootStore.columnStore.currentNamespace
        this.yamlJson.forEach(async (v) => {
            let kind = v.kind
            let name = v.metadata.name
            let json = await post(`${host}/kube/namespace/${ns}/${kind}`, v)
            if (json.success) {
                notification.info({
                    message: `${kind} ${name} create success`
                })
            } else {
                notification.error({
                    message: json.msg
                })
            }
        })
    }

    saveTemplate = () => {
        this.formInstance.validateFields().then(async (values) => {
            const formtext = YAML.stringify(this.templateData)
            let temp = this.yamlCurrent
            if (temp) {
                temp += '\n---\n'
            }
            temp += formtext
            runInAction(() => {
                this.yamlCurrent = temp
            })
            this.toggleTemplateFormVisible()
        })
    }

    @observable
    templateData = {}

    @action
    initalTemplateData = () => {
        if (this.yamlJson && this.yamlJson.length > 0) {
            this.templateData = this.yamlJson[0]
            return
        }
        console.log(this.kind)
        console.log(this.kindDef(this.kind))
        let def = this.apiDefinitions[this.kindDef(this.kind)];
        let requiredObj = {};
        Object.keys(def.required ? def.required : []).forEach(p => {
            let o = def.properties[p]
            if (o.type && o.type == 'string') {
                requiredObj[p] = ''
            }
            if (o.type && o.type == 'array') {
                requiredObj[p] = []
            }
            if (o.$ref) {
                requiredObj[p] = {}
            }
        })
        this.templateData = {
            kind: def['x-kubernetes-group-version-kind'][0].kind,
            apiVersion: def['x-kubernetes-group-version-kind'][0].version,
            metadata: { name: '' },
            ...requiredObj
        }
    }

    @computed
    get templateView() {
        if (!this.kindDef(this.kind)) {
            return []
        }
        const data = toJS(this.templateData),
            def = this.apiDefinitions[this.kindDef(this.kind)],
            view = [{ type: 'ref', addproperties: this.addproperties(data, def.properties, def.required), local: [], action: 'add_ref', property: def.properties }]
        console.log('----templateData------')
        console.log(data);
        this.createView(view, data, def, [])
        console.log('---templateView---')
        console.log(view)
        return view;
    }

    createArrayView = (view, arr, def, _local, currentkey) => {
        arr.forEach((data, index) => {
            let local = _local.concat(index)
            view.push({
                type: 'ref', key: `${currentkey}-[${index + 1}]`, value: data, local, property: def.properties,
                addproperties: this.addproperties(data, def.properties, def.required), action: 'add_ref', required: def.required, description: def.description, children: []
            })
            this.createView(view[view.length - 1].children, data, def, local)
        })
    }

    createView = (view, data, def, _local) => {
        Object.keys(data).forEach(k => {
            let value = data[k]
            let local = [].concat(_local)
            local.push(k)
            let property = def.properties[k]
            let switchstr = this.switchProperity(property)
            let pushobj = { type: switchstr, value: value, key: k, local: local, description: property.description }, ref
            switch (switchstr) {
                case 'ref':
                    ref = property.$ref.replace('#/definitions/', '')
                    pushobj = {
                        ...pushobj, addproperties: this.addproperties(value, this.apiDefinitions[ref].properties, this.apiDefinitions[ref].required),
                        property: this.apiDefinitions[ref].properties, action: 'add_ref', required: this.apiDefinitions[ref].required,
                        description: this.apiDefinitions[ref].description, children: []
                    }
                    view.push(pushobj)
                    this.createView(view[view.length - 1].children, value, this.apiDefinitions[ref], local)
                    break;
                case 'string':
                    view.push({ ...pushobj, selectValue: property.selectValue })
                    break;
                case 'integer':
                    view.push(pushobj)
                    break;
                case 'boolean':
                    view.push(pushobj)
                    break;
                case 'additional_string':
                    view.push({ ...pushobj, action: 'add_additional_string', children: [] })
                    Object.keys(value).forEach(key => {
                        view[view.length - 1].children.push({ type: switchstr, value: value[key], key: key, local: local, })
                    })
                    break;
                case 'additional_ref':
                    ref = property.additionalProperties.$ref.replace('#/definitions/', '')
                    pushobj = {
                        ...pushobj, addproperties: this.addproperties(value, this.apiDefinitions[ref].properties, this.apiDefinitions[ref].required),
                        property: this.apiDefinitions[ref].properties, action: 'add_ref', required: this.apiDefinitions[ref].required,
                        description: this.apiDefinitions[ref].description, children: []
                    }
                    view.push(pushobj)
                    this.createView(view[view.length - 1].children, value, this.apiDefinitions[ref], local)
                    break;
                case 'array_ref':
                    ref = property.items.$ref.replace('#/definitions/', '')
                    view.push({
                        ...pushobj, action: 'add_array_ref', property: this.apiDefinitions[ref].properties,
                        required: this.apiDefinitions[ref].required, children: []
                    })
                    this.createArrayView(view[view.length - 1].children, value, this.apiDefinitions[ref], local, k)
                    break;
                case 'array_string':
                    view.push({ ...pushobj, action: 'add_array_string', children: [] })
                    value.forEach((v, index) => {
                        view[view.length - 1].children.push({ type: switchstr, value: v, key: index, local: local.concat(index) })
                    })
                    break;
                default:
                    break;
            }
        })
    }

    switchProperity = (property) => {
        let operation = null
        if (!property) {
            return operation
        }
        if (property.$ref) {
            operation = 'ref'
        }
        if (property.type == 'boolean') {
            operation = 'boolean'
        }
        if (property.type == 'string') {
            if (property.format) {
                operation = null
            } else {
                operation = 'string'
            }
        }
        if (property.type == 'integer') {
            operation = 'integer'
        }
        if (property.type == 'object') {
            if (property.properties) {
                operation = 'definitions'
            }
            if (property.additionalProperties) {
                let additional = property.additionalProperties
                if (additional.$ref) {
                    operation = 'additional_ref'
                }
                if (additional.type == 'string') {
                    operation = 'additional_string'
                    if (additional.format == 'byte') {
                        // binaryData do nothing
                        operation = null
                    }
                }
                if (additional.type == 'array') {
                    //TODO
                    operation = null
                }
            }
        }
        if (property.type == 'array') {
            if (property.items.$ref) {
                operation = 'array_ref'
            }
            if (property.items.type == 'string') {
                operation = 'array_string'
            }
        }
        if (!operation) {
            console.warn('do noting', property)
        }
        return operation

    }

    addproperties = (data, properties, required = []) => {
        const arr = []
        if (!properties) {
            return arr
        }
        Object.keys(properties).forEach(k => {
            let flag = true
            // if (this.switchProperity(properties[k]) == 'ref') {
            //     let ref = properties[k].$ref.replace('#/definitions/', '')
            //     if (!this.switchProperity(this.apiDefinitions[ref])) {
            //         flag = false
            //     }
            // }
            if (/read(-?|\s)only/i.test(properties[k].description)) {
                flag = false
            }
            Object.keys(data).forEach(k2 => {
                if (k == k2) {
                    flag = false
                }
            })
            if (flag) {
                arr.push(k)
            }
        })
        return arr.sort((a, b) => required.indexOf(b) - required.indexOf(a)).map(_ => required.find(r => r == _) ? { text: _, required: true } : { text: _, required: false })
    }

    localToPath = (local, added = []) => local.concat(added).reduce((a, b) => a + (/^\d+$/.test(b) ? `[${b}]` : `.${b}`))

    addAdditionalString = (local, key) => action(() => {
        let path = this.localToPath(local)
        const _this = this
        let evalStr = `_this.templateData.${path}={..._this.templateData.${path},'key':'value'}`
        console.log(evalStr)
        eval(evalStr)
    })

    deleteField = (local) => action(() => {
        //let temp = toJS(this.templateData)
        const latest = local[local.length - 1]
        if (isNumber(latest)) {
            this._deleteArr(local)
            return
        }

        let path = this.localToPath(local)
        const _this = this
        let evalStr = `delete _this.templateData.${path}`
        console.log(evalStr)
        eval(evalStr)
    })

    _deleteArr = (local) => {
        //  this.splice(index, 1);
        let index = local.pop()
        let path = this.localToPath(local)
        const _this = this
        let evalStr = `_this.templateData.${path}.splice(${index}, 1)`
        console.log(evalStr)
        eval(evalStr)
    }

    editSelectField = (local) => action((e) => {
        const path = this.localToPath(local)
        const _this = this
        if (isBool(e)) {
            eval(`_this.templateData.${path}=${e}`)
        } else {
            eval(`_this.templateData.${path}='${e}'`)
        }

    })

    editStringField = (local) => action((e) => {
        const newv = e.target.value
        if (!newv) {
            return
        }
        const path = this.localToPath(local)
        const _this = this
        eval(`_this.templateData.${path}='${newv}'`)
    })

    editNumField = (local) => action((e) => {
        const newv = e.target.value
        if (!newv) {
            return
        }
        const path = this.localToPath(local)
        const _this = this
        eval(`_this.templateData.${path}=${newv}`)
    })

    onBlurAdditionalStringkey = (local, oldkey) => action((e) => {
        const newkey = e.target.value
        if (!newkey) {
            return
        }
        const path = this.localToPath(local)
        const _this = this
        let oldvalue = eval(`_this.templateData.${path}['${oldkey}']`)
        eval(`delete _this.templateData.${path}['${oldkey}']`)
        eval(`_this.templateData.${path}['${newkey}']='${oldvalue}'`)
    })

    onBlurAdditionalStringValue = (local, key) => action((e) => {
        const newvalue = e.target.value
        if (!newvalue) {
            return
        }
        //let temp = toJS(this.templateData)
        const path = this.localToPath(local)
        const _this = this
        eval(`_this.templateData.${path}.${key}='${newvalue}'`)
        //this.templateData = temp
    })

    addObjProperity = (local, property, actField, addproperties) => action(() => {
        let key = this.formInstance.getFieldValue(local.concat(actField))
        //let temp = toJS(this.templateData)
        let path = this.localToPath(local, key)
        console.log('---addObjProperity---', key)
        console.log(property[key])
        let switchstr = this.switchProperity(property[key])
        let evalStr = ''
        const _this = this
        switch (switchstr) {
            case 'ref':
                evalStr = `_this.templateData.${path}={}`
                break;
            case 'string':
                evalStr = `_this.templateData.${path}=''`
                break;
            case 'integer':
                evalStr = `_this.templateData.${path}=0`
                break;
            case 'boolean':
                evalStr = `_this.templateData.${path}=false`
                break;
            case 'additional_ref':
                evalStr = `_this.templateData.${path}={}`
                break;
            case 'additional_string':
                //evalStr = `temp.${path}={...temp.${path},'newkey':''}`
                evalStr = `_this.templateData.${path}={}`
                break;
            case 'array_ref':
                evalStr = `_this.templateData.${path}=[]`
                break;
            case 'array_string':
                evalStr = `_this.templateData.${path}=[]`
                break;
            default:
                evalStr = ''
                break;
        }
        console.log(evalStr)
        eval(evalStr)
        const arr = addproperties.map(_ => _.text).filter(p => p != key)
        if (arr[0]) {
            this.formInstance.validateFields().then(async (values) => {
                const pth = this.localToPath(local, actField)
                eval(`values.${pth}='${arr[0]}'`)
                this.formInstance.setFieldsValue(values)
            })
        }
    })

    addArrayRef = (local) => action(() => {
        let path = this.localToPath(local)
        const _this = this
        let evalStr = `_this.templateData.${path}.push({})`
        console.log(evalStr)
        eval(evalStr)

    })

    addArrayString = (local) => action(() => {
        let path = this.localToPath(local)
        const _this = this
        let evalStr = `_this.templateData.${path}.push('')`
        console.log(evalStr)
        eval(evalStr)
    })
}

@inject('rootStore')
@observer
class TemplateForm extends Component {

    componentDidMount() {
        const store = this.props.rootStore.createStore
        //store.loadRegistryImages()
        store.loadDefinitions()
    }

    componentWillUnmount() {
        this.props.rootStore.createStore.setKind('')
    }

    createField = (view) => {
        const store = this.props.rootStore.createStore;
        if (view.type == 'string') {
            return (
                <Space key={view.local.join('.')} style={{ display: 'flex', marginLeft: 24, marginBottom: 8, height: 32 }} align="start">
                    <Tag color="#2db7f5" style={{ height: 31, fontSize: 14, paddingTop: 4 }} >
                        {view.key}&nbsp;<Tooltip placement="right" title={view.description} color={'cyan'} ><QuestionCircleOutlined /></Tooltip>
                    </Tag>
                    <Form.Item key={view.local.join('.')} name={view.local}>
                        {
                            view.selectValue && view.selectValue.length > 0 ?
                                <Select style={{ width: 300, }} onSelect={store.editSelectField(view.local)}  >
                                    {
                                        view.selectValue.map(v => <Option key={store.randomKey()} value={v}>{v}</Option>)
                                    }
                                </Select>
                                :
                                <Input style={{ width: 300, }} onBlur={store.editStringField(view.local)} />
                        }
                    </Form.Item>
                    <Button type="ghost" shape="circle" onClick={store.deleteField(view.local)} icon={<MinusOutlined />}></Button>
                </Space>
            )
        }
        if (view.type == 'boolean') {
            return (
                <Space key={view.local.join('.')} style={{ display: 'flex', marginLeft: 24, marginBottom: 8, height: 32 }} align="start">
                    <Tag color="#2db7f5" style={{ height: 31, fontSize: 14, paddingTop: 4 }} >
                        {view.key}&nbsp;<Tooltip placement="right" title={view.description} color={'cyan'} ><QuestionCircleOutlined /></Tooltip>
                    </Tag>
                    <Form.Item key={view.local.join('.')} name={view.local}>
                        <Select style={{ width: 300, }} onSelect={store.editSelectField(view.local)}  >
                            <Option value={true}>true</Option>
                            <Option value={false}>false</Option>
                        </Select>
                    </Form.Item>
                    <Button type="ghost" shape="circle" onClick={store.deleteField(view.local)} icon={<MinusOutlined />}></Button>
                </Space>
            )
        }
        if (view.type == 'integer') {
            return (
                <Space key={view.local.join('.')} style={{ display: 'flex', marginLeft: 24, marginBottom: 8, height: 32 }} align="start">
                    <Tag color="#2db7f5" style={{ height: 31, fontSize: 14, paddingTop: 4 }} >
                        {view.key}&nbsp;<Tooltip placement="right" title={view.description} color={'cyan'} ><QuestionCircleOutlined /></Tooltip>
                    </Tag>
                    <Form.Item name={view.local} >
                        <InputNumber style={{ width: 300, }} onBlur={store.editNumField(view.local)} />
                    </Form.Item>
                    <Button type="ghost" shape="circle" onClick={store.deleteField(view.local)} icon={<MinusOutlined />}></Button>
                </Space>
            )
        }
        if (view.type == 'additional_string') {
            return (
                <Space key={store.randomKey()} style={{ display: 'flex', marginLeft: 24, marginBottom: 8, }} align="start">
                    <Form.Item noStyle rules={[{ required: true, message: 'key is required', validateTrigger: 'onBlur' }]} >
                        <Input placeholder="key" style={{ width: 300, }} defaultValue={view.key} onBlur={store.onBlurAdditionalStringkey(view.local, view.key)} />
                    </Form.Item>
                    <Form.Item noStyle rules={[{ required: true, message: 'value is required', validateTrigger: 'onBlur' }]} >
                        <Input placeholder="value" style={{ width: 300, }} defaultValue={view.value} onBlur={store.onBlurAdditionalStringValue(view.local, view.key)} />
                    </Form.Item>
                    <Button type="ghost" onClick={store.deleteField(view.local.concat(view.key))} shape="circle" icon={<MinusOutlined />}></Button>
                </Space>
            )
        }
        if (view.type == 'array_string') {
            console.log('array_string', view)
            return (
                <Space key={store.randomKey()} style={{ display: 'flex', marginLeft: 24, marginBottom: 8, }} align="start" >
                    <Form.Item noStyle name={view.local}>
                        <Input style={{ width: 300, }} onBlur={store.editStringField(view.local)} />
                    </Form.Item>
                    <Button type="ghost" shape="circle" onClick={store.deleteField(view.local)} icon={<MinusOutlined />}></Button>
                </Space>
            )
        }
    }

    createPanelHead = (view, min) => {
        const store = this.props.rootStore.createStore;
        if (view.action == 'add_ref') {
            return (
                <Space onClick={e => e.stopPropagation()} key={store.randomKey()} style={{ display: 'flex', marginBottom: 8, paddingTop: 0, paddingBottom: 0 }} align="start">
                    {
                        view.key ?
                            <Tag color="#87d068" style={{ height: 31, fontSize: 14, paddingTop: 4 }} >
                                {view.key}&nbsp;<Tooltip placement="right" title={view.description} color={'cyan'} ><QuestionCircleOutlined /></Tooltip>
                            </Tag>
                            : ''
                    }
                    <Form.Item label={view.key} noStyle name={view.local.concat('action_addObjProperity')}>
                        <Select style={{ width: 300, }} disabled={view.addproperties.length == 0 ? true : false}  >
                            {
                                view.addproperties.map(({ text, required }) => {
                                    if (required) {
                                        return <Option key={text} value={text}><span style={{ color: 'red' }}>{text} &nbsp;(required)</span></Option>
                                    } else {
                                        return <Option key={text} value={text}>{text}</Option>
                                    }
                                })
                            }
                        </Select>
                    </Form.Item>
                    <Button type="ghost" disabled={view.addproperties.length == 0 ? true : false} shape="circle" onClick={store.addObjProperity(view.local, view.property, 'action_addObjProperity', view.addproperties)} icon={<PlusOutlined />}></Button>
                    {
                        min ? '' : <Button type="ghost" disabled={view.local.length == 0 ? true : false} shape="circle" onClick={store.deleteField(view.local)} icon={<MinusOutlined />}></Button>
                    }
                </Space>
            )
        }
        if (view.action == 'add_additional_string') {
            return (
                <Space key={store.randomKey()} onClick={e => e.stopPropagation()} style={{ display: 'flex', marginBottom: 8 }} align="start">
                    <Tag color="#87d068" style={{ height: 31, fontSize: 14, paddingTop: 4 }} >
                        {view.key}&nbsp;<Tooltip placement="right" title={view.description} color={'cyan'} ><QuestionCircleOutlined /></Tooltip>
                    </Tag>
                    <Button type="ghost" shape="circle" onClick={store.addAdditionalString(view.local, view.key)} icon={<PlusOutlined />}></Button>
                    <Button type="ghost" shape="circle" onClick={store.deleteField(view.local)} icon={<MinusOutlined />}></Button>
                </Space>
            )
        }
        if (view.action == 'add_array_ref') {
            return (
                <Space key={store.randomKey()} onClick={e => e.stopPropagation()} style={{ display: 'flex', marginBottom: 8 }} align="start">
                    <Tag color="#87d068" style={{ height: 31, fontSize: 14, paddingTop: 4 }} >
                        {view.key}&nbsp;<Tooltip placement="right" title={view.description} color={'cyan'} ><QuestionCircleOutlined /></Tooltip>
                    </Tag>
                    <Button type="ghost" shape="circle" onClick={store.addArrayRef(view.local, view.property)} icon={<PlusOutlined />}></Button>
                    <Button type="ghost" shape="circle" onClick={store.deleteField(view.local)} icon={<MinusOutlined />}></Button>
                </Space>
            )
        }
        if (view.action == 'add_array_string') {
            return (
                <Space key={store.randomKey()} onClick={e => e.stopPropagation()} style={{ display: 'flex', marginBottom: 8 }} align="start">
                    <Tag color="#87d068" style={{ height: 31, fontSize: 14, paddingTop: 4 }} >
                        {view.key}&nbsp;<Tooltip placement="right" title={view.description} color={'cyan'} ><QuestionCircleOutlined /></Tooltip>
                    </Tag>
                    <Button type="ghost" shape="circle" onClick={store.addArrayString(view.local)} icon={<PlusOutlined />}></Button>
                    <Button type="ghost" shape="circle" onClick={store.deleteField(view.local)} icon={<MinusOutlined />}></Button>
                </Space>
            )
        }
    }

    createView = (list) => {
        const store = this.props.rootStore.createStore;
        if (!list) return ''
        return list.map(view => {
            if (view.action) {
                const header = this.createPanelHead(view)
                return (
                    <Collapse defaultActiveKey={['1']} bordered={true} key={store.randomKey()} style={{ paddingBottom: 0 }} >
                        <Panel header={header} key="1" style={{ paddingBottom: 0 }}>
                            {
                                this.createView(view.children)
                            }
                        </Panel>
                    </Collapse>
                )
            }
            return this.createField(view)
        })
    }

    createInital = () => {
        const store = this.props.rootStore.createStore;
        if (store.templateView.length == 0) {
            return ''
        }
        let first = store.templateView[0]
        const header = this.createPanelHead(first, true)
        return (
            <Collapse defaultActiveKey={['1']} style={{}}  >
                <Panel header={header} key="1" disabled={true} style={{ paddingTop: 0, paddingBottom: 0 }}>
                    <Space key={'kind'} style={{ display: 'flex', marginBottom: 8, height: 32 }} align="start">
                        <Tag color="#2db7f5" style={{ height: 31, fontSize: 14, paddingTop: 4 }} >
                            kind&nbsp;<Tooltip placement="right" title={store.templateView[1].description} color={'cyan'} ><QuestionCircleOutlined /></Tooltip>
                        </Tag>
                        <Form.Item name='kind'>
                            <Input style={{ width: 300, }} disabled />
                        </Form.Item>
                    </Space>
                    <Space key='apiVersion' style={{ display: 'flex', marginBottom: 8, height: 32 }} align="start">
                        <Tag color="#2db7f5" style={{ height: 31, fontSize: 14, paddingTop: 4 }} >
                            apiVersion&nbsp;<Tooltip placement="right" title={store.templateView[2].description} color={'cyan'} ><QuestionCircleOutlined /></Tooltip>
                        </Tag>
                        <Form.Item name='apiVersion' >
                            <Input style={{ width: 300, }} disabled />
                        </Form.Item>
                    </Space>
                    {
                        store.templateView.map((view, index) => {
                            if (index > 0) {
                                if (view.action) {
                                    return (
                                        <Collapse defaultActiveKey={['1']} bordered={true} key={store.randomKey()}  >
                                            <Panel header={this.createPanelHead(view)} key="1">
                                                {
                                                    this.createView(view.children)
                                                }
                                            </Panel>
                                        </Collapse>
                                    )
                                }

                            }
                        })
                    }
                </Panel>
            </Collapse>
        )
    }

    render() {
        const store = this.props.rootStore.createStore;
        console.log('render')
        return <Form ref={store.refFormInstance}>
            <div style={{ marginBottom: 30 }}>
                <Row>
                    <Col>
                        <Space onClick={e => e.stopPropagation()} key={store.randomKey()} style={{ display: 'flex', marginBottom: 8 }} align="start">
                            <Tag color="#87d068" style={{ height: 31, fontSize: 14, paddingTop: 4 }} >
                                select resources
                            </Tag>
                            <Select style={{ width: 200 }} onChange={store.setKind} value={store.kind}>
                                {
                                    store.kindList.map(k => <Option key={k} value={k}>{k}</Option>)
                                }
                            </Select>
                        </Space>
                    </Col>
                </Row>
            </div>
            {
                this.createInital()
            }
        </Form >
    }

}


@inject('rootStore')
@observer
class CreateYaml extends Component {
    componentDidMount() {
    }

    render() {
        const store = this.props.rootStore.createStore
        return (
            <div className={'pod'}>
                <CodeMirror
                    style={{ height: '700px', paddingBottom: '20px' }}
                    value={store.yamlCurrent}
                    options={
                        {
                            mode: 'yaml',
                            theme: 'idea',
                            lineNumbers: true
                        }
                    }
                    onBeforeChange={store.onEditor}
                />
            </div>
        )
    }
}



@inject('rootStore')
@observer
class CreateTab extends Component {

    componentDidMount() {
        const store = this.props.rootStore.createStore
        store.loadRegistryImages()
    }

    render() {
        const store = this.props.rootStore.createStore
        const operations = <Space key={store.randomKey()} style={{ display: 'flex', marginBottom: 8, }} align="start" >
            <Button onClick={store.toggleTemplateFormVisible} >template</Button>
            <Button type="primary" onClick={store.save} >submit</Button>
        </Space>
        return (
            <div>
                <Modal
                    title="Template"
                    visible={store.templateFormVisible}
                    onOk={store.saveTemplate}
                    onCancel={store.toggleTemplateFormVisible}
                    destroyOnClose={true}
                    width={1200}
                >
                    <TemplateForm />
                </Modal>
                <Tabs defaultActiveKey="1" tabBarExtraContent={operations} onChange={store.changeTab} >
                    <TabPane tab="Yaml" key="1">
                        <CreateYaml />
                    </TabPane>
                </Tabs>
            </div>
        )
    }
}


export { CreateTab, CreateStore }
