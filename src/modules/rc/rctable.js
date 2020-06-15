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
        console.log(this.props.rootStore.list('rc'))
        return (
            <div>
                <Table
                    columns={this.props.rootStore.columnStore.rcColumns}
                    rowKey={record => record.metadata.uid}
                    dataSource={this.props.rootStore.list('rc')}
                    size="small"
                />
            </div>
        );
    }
}

export default RsTable;