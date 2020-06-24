import React, { Component } from 'react';
import {
    Table, Descriptions, Tag, Tooltip
} from 'antd';
import { inject, observer } from 'mobx-react';



@inject('rootStore')
@observer
class Conditions extends Component {

    columns = [
        { dataIndex: 'type', title: 'type', width: 150 },
        { dataIndex: 'status', title: 'status', width: 150 },
        { dataIndex: 'reason', title: 'reason', width: 150 },
        { dataIndex: 'message', title: 'message', width: 150 },
        { dataIndex: 'lastTransitionTime', title: 'lastTransitionTime', width: 150, render: this.props.rootStore.columnStore._calculateAge }
    ]

    render() {
        return (
            <div>
                <span>Conditions</span>
                <Table
                    columns={this.columns}
                    rowKey={record => record.type}
                    dataSource={this.props.list}
                    size="small"
                />
            </div>
        );
    }
}


@inject('rootStore')
@observer
class Metadata extends Component {

    render() {

        const cstore = this.props.rootStore.columnStore
        return (
            <Descriptions title="Metadata " size={'small'} bordered>
                <Descriptions.Item label="Age" span={3}>
                    {cstore._calculateAge(this.props.info.metadata.creationTimestamp)}
                </Descriptions.Item>
                <Descriptions.Item label="Labels" span={3}>
                    {cstore.createLabels(this.props.info.metadata.labels)}
                </Descriptions.Item>
                <Descriptions.Item label="Annotations" span={3}>
                    {cstore.createAnnotations(this.props.info.metadata.annotations)}
                </Descriptions.Item>

            </Descriptions>
        )
    }
}

@inject('rootStore')
@observer
class PodTemplate extends Component {

    render() {
        const store = this.props.rootStore.store(this.props.kind)
        const pod = store.currentElement.spec.template
        return (
            <div>
                {
                    pod.spec.containers.map(c => {
                        return (
                            <Descriptions key={Math.random().toString().substr(2, 10)} title={`Container ${c.name}`} size={'small'} bordered>
                                <Descriptions.Item label="Image" span={3}>{c.image}</Descriptions.Item>
                                {
                                    store.volumeMountList.filter(_ => _.containerName === c.name).length > 0 ?
                                        <Descriptions.Item label="Volume Mounts" span={3}>
                                            <Table
                                                columns={[
                                                    {
                                                        dataIndex: 'name', title: 'name', width: 120,

                                                    },
                                                    { dataIndex: 'kind', title: 'Kind', width: 100 },
                                                    { dataIndex: 'mountPath', title: 'Mount Path', width: 100 },
                                                    { dataIndex: 'subPath', title: 'Sub Path', width: 100 },
                                                    {
                                                        dataIndex: 'refName', title: 'Link', width: 100,
                                                        render: (v, record) => {
                                                            if (!v) {
                                                                return ''
                                                            }
                                                            const short = this.props.rootStore.shortName(record.kind)
                                                            return <Tag color="success"><a onClick={() => { this.props.rootStore.menuStore.goto(short, v, null, `/k8s/${short}/detail`) }}>{v}</a></Tag>
                                                        }
                                                    }
                                                ]}
                                                rowKey={record => record.name}
                                                dataSource={store.volumeMountList.filter(_ => _.containerName === c.name)}
                                                size="small"
                                                pagination={{ pageSize: 5 }}
                                            />
                                        </Descriptions.Item>
                                        : ''
                                }
                                {
                                    store.envList.filter(_ => _.containerName === c.name).length > 0 ?
                                        <Descriptions.Item label="Env" span={3}>
                                            <Table
                                                columns={[
                                                    { dataIndex: 'name', title: 'name', width: 120 },
                                                    { dataIndex: 'kind', title: 'Kind', width: 70 },
                                                    {
                                                        dataIndex: 'value', title: 'Value', width: 300,
                                                        render: v => {
                                                            if (!v) return ''
                                                            if (v.length > 40) {
                                                                return <Tooltip title={v}><div style={{ width: '300px' }}>{v.substr(0, 28) + '...'}</div></Tooltip>
                                                            }
                                                            return <div style={{ width: '300px' }}>{v}</div>
                                                        }
                                                    },
                                                    {
                                                        dataIndex: 'refName', title: 'Link', width: 100,
                                                        render: (v, record) => {
                                                            if (!v) {
                                                                return ''
                                                            }
                                                            const short = this.props.rootStore.shortName(record.kind)
                                                            return <Tag color="success"><a onClick={() => { this.props.rootStore.menuStore.goto(short, v, null, `/k8s/${short}/detail`) }}>{v}</a></Tag>
                                                        }
                                                    },
                                                ]}
                                                rowKey={record => record.name}
                                                dataSource={store.envList.filter(_ => _.containerName === c.name)}
                                                size="small"
                                                pagination={{ pageSize: 5 }}
                                            />
                                        </Descriptions.Item>
                                        : ''
                                }
                                {
                                    c.resources ?
                                        <Descriptions.Item label="Resources" span={3}>
                                            {
                                                c.resources.requests && c.resources.requests.memory ?
                                                    <div>Request-Memory : {c.resources.requests.memory}</div>
                                                    : ''
                                            }
                                            {
                                                c.resources.requests && c.resources.requests.cpu ?
                                                    <div>Request-CPU : {c.resources.requests.cpu}</div>
                                                    : ''
                                            }
                                            {
                                                c.resources.limits && c.resources.limits.memory ?
                                                    <div>Limit-Memory : {c.resources.limits.memory}</div>
                                                    : ''
                                            }
                                            {
                                                c.resources.limits && c.resources.limits.cpu ?
                                                    <div>Limit-CPU: {c.resources.limits.cpu}</div>
                                                    : ''
                                            }
                                        </Descriptions.Item>
                                        : ''
                                }
                            </Descriptions>)
                    })

                }
            </div>
        )
    }
}

@inject('rootStore')
@observer
class PodTemplateVolumes extends Component {

    cloumns = [
        { dataIndex: 'name', title: 'Name', width: 150 },
        { dataIndex: 'kind', title: 'Kind', width: 100 },
        { dataIndex: 'description', title: 'Description', width: 200 },
        {
            dataIndex: 'refName', title: 'Link', width: 200,
            render: (v, record) => {
                if (!v) {
                    return ''
                }
                const short = this.props.rootStore.shortName(record.kind)
                return <Tag color="success"><a onClick={() => { this.props.rootStore.menuStore.goto(short, v, null, `/k8s/${short}/detail`) }}>{v}</a></Tag>
            }
        }
    ]

    render() {
        const store = this.props.rootStore.store(this.props.kind)
        return (
            <div>
                <span>Volumes</span>
                <Table
                    columns={this.cloumns}
                    rowKey={record => record.name}
                    dataSource={store.volumeList}
                    size="small"
                />
            </div>
        )
    }
}

export { Conditions, Metadata, PodTemplate, PodTemplateVolumes };