import React, { Component } from 'react';
import {
    Modal, Badge, Icon, Input, Table, Dropdown, Menu, Button, Divider, Popconfirm
} from 'antd';
import { inject, observer } from 'mobx-react';


@inject('rootStore')
@observer
class CrTable extends Component {

    componentDidMount() {

    }

    render() {
        return (
            <div>
                <Table
                    columns={this.props.rootStore.columnStore.crColumns}
                    rowKey={record => record.metadata.uid}
                    dataSource={this.props.rootStore.list('cr')}
                    size="small"
                />
            </div>
        );
    }
}

export default CrTable;