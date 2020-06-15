import React, { Component } from 'react';
import {
    Modal, Badge, Icon, Input, Table, Dropdown, Menu, Button, Divider, Popconfirm
} from 'antd';
import { inject, observer } from 'mobx-react';


@inject('rootStore')
@observer
class PvTable extends Component {

    componentDidMount() {

    }

    render() {
        return (
            <div>
                <Table
                    columns={this.props.rootStore.columnStore.pvColumns}
                    rowKey={record => record.metadata.uid}
                    dataSource={this.props.rootStore.list('pv')}
                    size="small"
                />
            </div>
        );
    }
}

export default PvTable;