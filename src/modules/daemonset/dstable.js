import React, { Component } from 'react';
import {
    Modal, Badge, Icon, Input, Table, Dropdown, Menu, Button, Divider, Popconfirm
} from 'antd';
import { inject, observer } from 'mobx-react';


@inject('rootStore')
@observer
class DsTable extends Component {

    componentDidMount() {

    }

    render() {
        console.log(this.props.rootStore.dsStore.list.filter(d => d))
        return (
            <div>
                <Table
                    columns={this.props.rootStore.columnStore.dsColumns}
                    rowKey={record => record.metadata.uid}
                    dataSource={this.props.rootStore.dsStore.list.filter(d => d)}
                    size="small"
                />
            </div>
        );
    }
}

export default DsTable;