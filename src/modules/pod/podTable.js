import React, { Component } from 'react';
import {
    Modal, Badge, Icon, Input, Table, Dropdown, Menu, Button, Divider, Popconfirm
} from 'antd';
import { toJS } from 'mobx'
import { inject, observer } from 'mobx-react';


@inject('rootStore')
@observer
class PodTable extends Component {

    componentDidMount() {
        console.log('PodTable componentDidMount');

        //this.props.rootStore.podStore.loadList();
    }

    render() {
        //console.log(this.props.rootStore.podStore.list.filter(this.props.filterFun))
        return (
            <div>
                <Table
                    columns={this.props.rootStore.columnStore.podColumns}
                    rowKey={record => record.metadata.uid}
                    dataSource={this.props.rootStore.podStore.list.filter(this.props.filterFun)}
                    size="small"
                />
            </div>
        );
    }
}

export default PodTable;