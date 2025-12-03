// @ts-nocheck
import React, { Component } from 'react';
import {
    Layout, Menu, Popover, Tooltip, Row, Col, Breadcrumb, notification, Select, Tag, Button, Drawer, Space,
} from 'antd';
const { Header, Sider, Content, Footer } = Layout;
const { Option } = Select
import { toJS } from 'mobx'
import { Link } from 'react-router-dom';
import { inject, observer } from 'mobx-react';
import { NavLink, Switch, Route, Redirect, withRouter } from 'react-router-dom';

import MenuTree from './menuTree';
import { NodeTable, NodeTabs } from '../node'
import { PodTable, PodTabs } from '../pod'
import { DeployTable, DeployTabs } from '../deploy'
import { RsTable, RsTabs } from '../replicaset'
import { DsTable, DsTabs } from '../daemonset'
import { StsTable, StsTabs } from '../statefulset'
import { RcTable, RcTabs } from '../rc'
import { JobTable, JobTabs } from '../job'
import { CjTable, CjTabs } from '../cj'
import { CmTable, CmTabs } from '../cm'
import { PvcTable, PvcTabs } from '../pvc'
import { PvTable, PvTabs } from '../pv'
import { SecretTable, SecretTabs } from '../secret'
import { SaTable, SaTabs } from '../sa'
import { SvcTable, SvcTabs } from '../svc'
import { IngTable, IngTabs } from '../ing'
import { HpaTable, HpaTabs } from '../hpa'
import { EventTable, EventTabs } from '../event'
import { RTable, RTabs } from '../role'
import { RbTable, RbTabs } from '../rolebind'
import { CrTable, CrTabs } from '../crole'
import { CrbTable, CrbTabs } from '../crolebind'
import { CreateTab } from '../create'
import { LimitsTable, LimitsTabs } from '../limits'
import { QuotaTable, QuotaTabs } from '../quota'


import SwaggerUI from "swagger-ui-react"
import "swagger-ui-react/swagger-ui.css"

import { host } from '../../config/api'
console.log('get host:', host)

import {
    MenuUnfoldOutlined,
    MenuFoldOutlined,
    CodeOutlined

} from '@ant-design/icons';



const renderMergedProps = (component, ...rest) => {
    const finalProps = Object.assign({}, ...rest);
    return (
        React.createElement(component, finalProps)
    );
};

const PropsRoute = ({ component, ...rest }) => {
    return (
        <Route {...rest} render={routeProps => {
            return renderMergedProps(component, routeProps, rest);
        }} />
    );
};

@inject('rootStore')
@observer
class Main extends Component {

    constructor(props) {
        super(props)
        this.state = {
            collapsed: false,
            createVisible: false
        }
    }

    toggle = () => {
        this.setState({
            collapsed: !this.state.collapsed,
        });
    };

    //UNSAFE_UNSAFE_componentWillUpdate
    static getDerivedStateFromProps(props, state) {
        console.log('main.js');
        //props.history.push('/k8s/deploy');
        //props.history.push('/k8s/deploy');
        let reloadflag = false
        if (props.host) {
            if (!window.API) window.API = {}
            window.API.HOST = props.host
            reloadflag = true
        }
        if (props.registry) {
            if (!window.API) window.API = {}
            window.API.REGISTRY = props.registry
            reloadflag = true
        }
        if (reloadflag) {
            require('../../config/api')
            console.log(host)
        }
        return state;
    }

    componentWillUnmount() {

    }

    componentDidMount() {
        const store = this.props.rootStore.columnStore;
        store.loadNs()
        let key = this.props.history.location.pathname.split("/")[this.props.history.location.pathname.split("/").length - 1]
        if (key) {
            console.log(key)
            this.props.rootStore.menuStore.onMenuClick({ key })
        }
    }

    render() {
        const store = this.props.rootStore.columnStore;
        const menuStore = this.props.rootStore.menuStore;
        //console.log(toJS(menuStore.currentRoute))
        const kind = this.props.rootStore.menuStore.currentKind
        return (
            <Layout style={{ height: '100vh' }}>
                <Sider trigger={null} collapsible collapsed={menuStore.collapsed} theme="light" width={260}>
                    <MenuTree />
                </Sider>
                <Layout style={{ height: 'auto' }}>
                    <Header style={{ background: '#fff', padding: 6, height: '8vh' }}>
                        <Row gutter={24}>
                            <Col span={1}>
                                <Button type="primary" onClick={menuStore.toggleCollapsed} >
                                    {React.createElement(menuStore.collapsed ? MenuUnfoldOutlined : MenuFoldOutlined)}
                                </Button>
                            </Col>
                            <Col span={16} >
                                <Breadcrumb style={{ margin: '20px 4px' }}>
                                    < Breadcrumb.Item > <CodeOutlined /></Breadcrumb.Item>
                                    {
                                        menuStore.currentRoute
                                            .filter(d => d).map((r, index) => {
                                                if (r.path) {
                                                    return <Breadcrumb.Item key={r.code}><Tag color="success"><Space><Link onClick={this.props.rootStore.menuStore.resetBreadcrumb(index)} to={r.path}>{!r.icon ? '' : <span>{React.createElement(require('../../config/icon')[r.icon])}</span>}{r.text}</Link></Space></Tag></Breadcrumb.Item>
                                                }
                                                return <Breadcrumb.Item key={r.code}><Space>{!r.icon ? '' : <span>{React.createElement(require('../../config/icon')[r.icon])}</span>}{r.text}</Space></Breadcrumb.Item>
                                            })
                                    }
                                </Breadcrumb>
                            </Col>
                            <Col span={4}>
                                <Select onChange={store.nsChange} value={store.currentNamespace} style={{ width: 200 }}
                                    options={toJS(store.allNamespace).map(n => ({ label: n, value: n }))}
                                />
                            </Col>
                            <Col span={2}>
                                <Button type="primary" onClick={() => { this.setState({ createVisible: true }) }} >
                                    CREATE
                                </Button>
                            </Col>
                        </Row>
                    </Header>
                    <Content
                        style={{
                            margin: '12px 8px',
                            //marginTop: '0',
                            padding: 12,
                            background: '#fff',
                            //minHeight: 800,
                            height: '92vh',
                            overflowY: 'scroll'
                        }}
                    >
                        <Switch>
                            <Route exact path="/k8s/no" component={NodeTable} />
                            <Route exact path="/k8s/no/detail" component={NodeTabs} />

                            <Route exact path="/k8s/pod" render={() => <PodTable filterFun={(d) => d} />} />
                            <Route exact path="/k8s/pod/detail" component={PodTabs} />

                            <Route exact path="/k8s/deploy" component={DeployTable} />
                            <Route exact path="/k8s/deploy/detail" component={DeployTabs} />

                            <Route exact path="/k8s/rs" component={RsTable} />
                            <Route exact path="/k8s/rs/detail" component={RsTabs} />

                            <Route exact path="/k8s/ds" component={DsTable} />
                            <Route exact path="/k8s/ds/detail" component={DsTabs} />

                            <Route exact path="/k8s/sts" component={StsTable} />
                            <Route exact path="/k8s/sts/detail" component={StsTabs} />

                            <Route exact path="/k8s/rc" component={RcTable} />
                            <Route exact path="/k8s/rc/detail" component={RcTabs} />

                            <Route exact path="/k8s/job" render={() => <JobTable filterFun={(d) => d} />} />
                            <Route exact path="/k8s/job/detail" component={JobTabs} />

                            <Route exact path="/k8s/cj" component={CjTable} />
                            <Route exact path="/k8s/cj/detail" component={CjTabs} />

                            <Route exact path="/k8s/cm" render={() => <CmTable filterFun={(d) => d} />} />
                            <Route exact path="/k8s/cm/detail" component={CmTabs} />

                            <Route exact path="/k8s/pvc" component={PvcTable} />
                            <Route exact path="/k8s/pvc/detail" component={PvcTabs} />

                            <Route exact path="/k8s/pv" component={PvTable} />
                            <Route exact path="/k8s/pv/detail" component={PvTabs} />

                            <Route exact path="/k8s/secret" component={SecretTable} />
                            <Route exact path="/k8s/secret/detail" component={SecretTabs} />

                            <Route exact path="/k8s/sa" component={SaTable} />
                            <Route exact path="/k8s/sa/detail" component={SaTabs} />

                            <Route exact path="/k8s/svc" component={SvcTable} />
                            <Route exact path="/k8s/svc/detail" component={SvcTabs} />

                            <Route exact path="/k8s/ing" component={IngTable} />
                            <Route exact path="/k8s/ing/detail" component={IngTabs} />

                            <Route exact path="/k8s/hpa" component={HpaTable} />
                            <Route exact path="/k8s/hpa/detail" component={HpaTabs} />

                            <Route exact path="/k8s/event" component={EventTable} />
                            <Route exact path="/k8s/event/detail" component={EventTabs} />

                            <Route exact path="/k8s/r" component={RTable} />
                            <Route exact path="/k8s/r/detail" component={RTabs} />

                            <Route exact path="/k8s/rb" component={RbTable} />
                            <Route exact path="/k8s/rb/detail" component={RbTabs} />

                            <Route exact path="/k8s/cr" component={CrTable} />
                            <Route exact path="/k8s/cr/detail" component={CrTabs} />

                            <Route exact path="/k8s/crb" component={CrbTable} />
                            <Route exact path="/k8s/crb/detail" component={CrbTabs} />

                            <Route exact path="/k8s/quota" component={QuotaTable} />
                            <Route exact path="/k8s/quota/detail" component={QuotaTabs} />

                            <Route exact path="/k8s/limits" component={LimitsTable} />
                            <Route exact path="/k8s/limits/detail" component={LimitsTabs} />

                            <Route exact path="/k8s/api" render={() => <SwaggerUI url={`${host}/kube/api`} />} />

                        </Switch>
                    </Content>

                </Layout>
                <Drawer
                    title="create"
                    placement="right"
                    width={1200}
                    closable={true}
                    onClose={() => { this.setState({ createVisible: false }) }}
                    visible={this.state.createVisible}
                >
                    <CreateTab />

                </Drawer>

            </Layout >

        );

    }
}

export default withRouter(Main);


