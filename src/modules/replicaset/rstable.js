import React, { Component } from 'react';
import {
    Modal, Badge, Icon, Input, Table, Dropdown, Menu, Button, Divider, Popconfirm
} from 'antd';
import { inject, observer } from 'mobx-react';


@inject('rootStore')
@observer
class RsTable extends Component {

    componentDidMount() {

    }

    render() {
        return (
            <div>
                <Table
                    columns={this.props.rootStore.columnStore.rsColumns}
                    rowKey={record => record.metadata.uid}
                    dataSource={this.props.rootStore.rsStore.list.filter(d => d)}
                    size="small"
                />
            </div>
        );
    }
}

export default RsTable;