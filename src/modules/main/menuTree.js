import React, { Component } from 'react';
import { Menu, Icon } from 'antd';
import {
    HomeOutlined,
} from '@ant-design/icons';
import { inject, observer, } from 'mobx-react';
import {
    configure,
    toJS
} from 'mobx';
import { Link, } from 'react-router-dom';

const SubMenu = Menu.SubMenu;


configure({ enforceActions: 'observed' });

@inject('rootStore')
@observer
class MenuTree extends Component {

    componentDidMount() {
    }
    // <img style={{ paddingRight: '10px' }} src={`data:image/svg+xml;base64,${new Buffer(item.icon).toString('base64')}`} /> : <Icon type={item.icon} />}
    renderTree = (data) => {
        return data.map(item => {
            const title = item.path
                ?
                <Link to={item.path}>
                    {!item.icon ? '' : React.createElement(require('../../config/icon')[item.icon])}
                    <span>{item.text}</span>
                </Link>
                :
                <span>
                    {!item.icon ? '' : React.createElement(require('../../config/icon')[item.icon])}
                    <span>{item.text}</span>
                </span>;
            if (item.children && item.children.length > 0) {
                return <SubMenu key={item.code} title={title}>
                    {this.renderTree(item.children)}
                </SubMenu>
            }
            return <Menu.Item key={item.code}>{title}</Menu.Item>

        })
    };

    render() {
        const store = this.props.rootStore.menuStore;
        console.log(store.menuTreeData)
        return (
            <div>
                <Menu onClick={store.onMenuClick} theme='light' mode="inline"
                    defaultSelectedKeys={['node']}
                    defaultOpenKeys={['application', 'cluster']}
                //inlineCollapsed={store.collapsed}
                >
                    {/* <Menu.Item key='home'><Link to='/home'><HomeOutlined /> <span>首页</span></Link></Menu.Item> */}
                    {
                        this.renderTree(store.menuTreeData)
                    }
                </Menu>
            </div>);

    }
}

export default MenuTree;
