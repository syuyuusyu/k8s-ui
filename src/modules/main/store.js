import { observable, configure, action, runInAction, computed, toJS } from 'mobx';



configure({ enforceActions: 'observed' });

export default class MenuStore {
    constructor(rootStore) {
        this.rootStore = rootStore;
    }

    @observable
    collapsed = false

    @action
    toggleCollapsed = () => {
        this.collapsed = !this.collapsed
    }

    menuTreeData = [
        {
            code: 'cluster',
            text: 'Cluster',
            leaf: "0",
            icon: 'ClusterIcon',
            children: [
                {
                    code: 'no',
                    text: 'node',
                    leaf: "1",
                    icon: 'NodeIcon',
                    path: '/k8s/no'
                },
                {
                    code: 'pv',
                    text: 'PersistentVolume',
                    leaf: "1",
                    icon: 'PvIcon',
                    path: '/k8s/pv'
                },
                {
                    code: 'crbac',
                    text: 'Cluster RBAC',
                    leaf: "0",
                    icon: 'RbacIcon',
                    children: [
                        {
                            code: 'cr',
                            text: 'ClusterRole',
                            leaf: "1",
                            icon: 'RoleIcon',
                            path: '/k8s/cr'
                        },
                        {
                            code: 'crb',
                            text: 'ClusterRoleBinding',
                            leaf: "1",
                            icon: 'RoleBindIcon',
                            path: '/k8s/crb'
                        },
                    ]
                },

            ]
        },
        {
            code: 'application',
            text: 'Application',
            leaf: "0",
            icon: 'ApplicationIcon',
            children: [
                {
                    code: 'workLoad',
                    text: 'workLoad',
                    leaf: "0",
                    icon: 'WorkloadIcon',
                    children: [
                        {
                            code: 'pod',
                            text: 'POD',
                            leaf: "1",
                            icon: 'PodIcon',
                            path: '/k8s/pod'
                        },
                        {
                            code: 'deploy',
                            text: 'Deploy',
                            leaf: "1",
                            icon: 'DeployIcon',
                            path: '/k8s/deploy'
                        },
                        {
                            code: 'rs',
                            text: 'ReplicaSet',
                            leaf: "1",
                            icon: 'RsIcon',
                            path: '/k8s/rs'
                        },
                        {
                            code: 'ds',
                            text: 'DaemonSet',
                            leaf: "1",
                            icon: 'DsIcon',
                            path: '/k8s/ds'
                        },
                        {
                            code: 'sts',
                            text: 'StatefulSet',
                            leaf: "1",
                            icon: 'StsIcon',
                            path: '/k8s/sts'
                        },
                        {
                            code: 'rc',
                            text: 'ReplicationController',
                            leaf: "1",
                            icon: 'RcIcon',
                            path: '/k8s/rc'
                        },
                        {
                            code: 'job',
                            text: 'Job',
                            leaf: "1",
                            icon: 'JobIcon',
                            path: '/k8s/job'
                        },
                        {
                            code: 'cj',
                            text: 'CronJob',
                            leaf: "1",
                            icon: 'CjIcon',
                            path: '/k8s/cj'
                        },
                        {
                            code: 'hpa',
                            text: 'HorizontalPodAutoscaler',
                            leaf: "1",
                            icon: 'HpaIcon',
                            path: '/k8s/hpa'
                        },
                    ]
                },
                {
                    code: 'configAndStorage',
                    text: 'Config and Storage',
                    leaf: "0",
                    icon: 'StorageIcon',
                    children: [
                        {
                            code: 'cm',
                            text: 'ConfigMap',
                            leaf: "1",
                            icon: 'CmIcon',
                            path: '/k8s/cm'
                        },
                        {
                            code: 'pvc',
                            text: 'PersistentVolumeClaim',
                            leaf: "1",
                            icon: 'PvcIcon',
                            path: '/k8s/pvc'
                        },
                        {
                            code: 'secret',
                            text: 'Secret',
                            leaf: "1",
                            icon: 'SecretIcon',
                            path: '/k8s/secret'
                        },
                        {
                            code: 'sa',
                            text: 'ServiceAccount',
                            leaf: "1",
                            icon: 'SaIcon',
                            path: '/k8s/sa'
                        },
                    ]
                },
                {
                    code: 'service',
                    text: 'Discover Service',
                    leaf: "0",
                    icon: 'ServiceIcon',
                    children: [
                        {
                            code: 'svc',
                            text: 'Service',
                            leaf: "1",
                            icon: 'SvcIcon',
                            path: '/k8s/svc'
                        },
                        {
                            code: 'ing',
                            text: 'Ingress',
                            leaf: "1",
                            icon: 'IngIcon',
                            path: '/k8s/ing'
                        },
                    ]
                },
                {
                    code: 'quotamenu',
                    text: 'Quota',
                    leaf: "0",
                    icon: 'QuotaIcon',
                    children: [
                        {
                            code: 'quota',
                            text: 'ResourceQuota',
                            leaf: "1",
                            icon: 'ResourceQuotaIcon',
                            path: '/k8s/quota'
                        },
                        {
                            code: 'limits',
                            text: 'LimitRange',
                            leaf: "1",
                            icon: 'LimitIcon',
                            path: '/k8s/limits'
                        },
                    ]
                },
                {
                    code: 'rbac',
                    text: 'RBAC',
                    leaf: "0",
                    icon: 'RbacIcon',
                    children: [
                        {
                            code: 'r',
                            text: 'Role',
                            leaf: "1",
                            icon: 'RoleIcon',
                            path: '/k8s/r'
                        },
                        {
                            code: 'rb',
                            text: 'RoleBinding',
                            leaf: "1",
                            icon: 'RoleBindIcon',
                            path: '/k8s/rb'
                        },
                    ]
                },
                {
                    code: 'event',
                    text: 'Event',
                    leaf: "1",
                    icon: 'EventIcon',
                    path: '/k8s/event'
                }

            ],

        },
        {
            code: 'api',
            text: 'API',
            leaf: "1",
            icon: 'ApiIcon',
            path: '/k8s/api'
        }
    ]

    resetBreadcrumb = (index) => action(() => {
        this.currentRoute.splice(index + 1)
    })

    @action
    goto = (kind, name, namespace, path) => {
        if (path) {
            this.rootStore.history.push(path)
        }
        if (namespace) {
            this.rootStore.columnStore.nsChange(namespace)
        }
        let { currentRoute } = this.rootStore.menuStore
        if (!currentRoute.find(_ => _.code === `${kind}-${name}`)) {
            currentRoute.push({
                code: `${kind}-${name}`,
                text: `${kind}->${name}`,
                path: `/k8s/${kind}/detail`
            })
        }
        this.rootStore.store(kind).setCurrentName(name)
    }

    @observable
    currentRoute = [];

    @action
    onMenuClick = (e) => {
        let clone = this.menuTreeData.filter(d => d);
        clone.forEach(data => {
            getPathById(e.key, data, (result) => {
                runInAction(() => {
                    this.currentRoute = result;
                });
            })
        });
    };




}

const getPathById = (code, catalog, callback) => {
    //定义变量保存当前结果路径
    let temppath = [];
    try {
        let getNodePath = (node) => {
            temppath.push(node);
            //找到符合条件的节点，通过throw终止掉递归
            if (node.code + '' === code + '') {
                throw (new Error("got it!"));
            }
            if (node.children && node.children.length > 0) {
                for (let i = 0; i < node.children.length; i++) {
                    getNodePath(node.children[i]);
                }
                //当前节点的子节点遍历完依旧没找到，则删除路径中的该节点
                temppath.pop();
            }
            else {
                //找到叶子节点时，删除路径当中的该叶子节点
                temppath.pop();
            }
        }
        getNodePath(catalog);
    }
    catch (e) {
        callback(temppath);
    }
};

