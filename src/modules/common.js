import React, { Component } from 'react';
import {
    Table, Descriptions
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

export { Conditions, Metadata };