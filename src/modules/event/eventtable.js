import React, { Component } from 'react';
import {
    Modal, Badge, Icon, Input, Table, Dropdown, Menu, Button, Divider, Popconfirm
} from 'antd';
import { inject, observer } from 'mobx-react';


@inject('rootStore')
@observer
class EventTable extends Component {

    componentDidMount() {

    }

    render() {
        console.log(this.props.rootStore.list('event'))
        return (
            <div>
                <Table
                    columns={this.props.rootStore.columnStore.eventColumns}
                    rowKey={record => record.metadata.uid}
                    dataSource={this.props.rootStore.list('event')}
                    size="small"
                />
            </div>
        );
    }
}

export default EventTable;