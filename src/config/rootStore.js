import { NodeStore } from '../modules/node'
import { ColumnStore } from '../modules/store'
import { PodStore } from '../modules/pod'
import { MenuStore } from '../modules/main'
import { DeployStore } from '../modules/deploy'
import { RsStore } from '../modules/replicaset'
import { DsStore } from '../modules/daemonset'
import { StsStore } from '../modules/statefulset'
import { RcStore } from '../modules/rc'
import { JobStore } from '../modules/job'
import { CjStore } from '../modules/cj'
import { CmStore } from '../modules/cm'
import { PvcStore } from '../modules/pvc'
import { PvStore } from '../modules/pv'
import { SecretStore } from '../modules/secret'
import { SaStore } from '../modules/sa'
import { SvcStore } from '../modules/svc'
import { IngStore } from '../modules/ing'
import { HpaStore } from '../modules/hpa'
import { EventStore } from '../modules/event'
import { RStore } from '../modules/role'
import { CrStore } from '../modules/crole'
import { RbStore } from '../modules/rolebind'
import { CrbStore } from '../modules/crolebind'
import { CreateStore } from '../modules/create'
import { LimitsStore } from '../modules/limits'
import { QuotaStore } from '../modules/quota'

export default class RootStore {


    constructor(history) {
        this.history = history
        this.nodeStore = new NodeStore(this)
        this.columnStore = new ColumnStore(this)
        this.podStore = new PodStore(this)
        this.menuStore = new MenuStore(this)
        this.deployStore = new DeployStore(this)
        this.rsStore = new RsStore(this)
        this.dsStore = new DsStore(this)
        this.stsStore = new StsStore(this)
        this.rcStore = new RcStore(this)
        this.jobStore = new JobStore(this)
        this.cjStore = new CjStore(this)
        this.cmStore = new CmStore(this)
        this.pvcStore = new PvcStore(this)
        this.pvStore = new PvStore(this)
        this.secretStore = new SecretStore(this)
        this.saStore = new SaStore(this)
        this.svcStore = new SvcStore(this)
        this.ingStore = new IngStore(this)
        this.hpaStore = new HpaStore(this)
        this.eventStore = new EventStore(this)
        this.rStore = new RStore(this)
        this.rbStore = new RbStore(this)
        this.crStore = new CrStore(this)
        this.crbStore = new CrbStore(this)
        this.createStore = new CreateStore(this)
        this.limitsStore = new LimitsStore(this)
        this.quotaStore = new QuotaStore(this)
    }

    storeMap = {
        'Pod': { name: 'pod', store: 'podStore' },
        'Node': { name: 'no', store: 'nodeStore' },
        'Deployment': { name: 'deploy', store: 'deployStore' },
        'ReplicaSet': { name: 'rs', store: 'rsStore' },
        'DaemonSet': { name: 'ds', store: 'dsStore' },
        'StatefulSet': { name: 'sts', store: 'stsStore' },
        'ReplicationController': { name: 'rc', store: 'rcStore' },
        'Job': { name: 'job', store: 'jobStore' },
        'CronJob': { name: 'cj', store: 'cjStore' },
        'ConfigMap': { name: 'cm', store: 'cmStore' },
        'PersistentVolumeClaim': { name: 'pvc', store: 'pvcStore' },
        'PersistentVolume': { name: 'pv', store: 'pvStore' },
        'Secret': { name: 'secret', store: 'secretStore' },
        'ServiceAccount': { name: 'sa', store: 'saStore' },
        'Service': { name: 'svc', store: 'svcStore' },
        'Ingress': { name: 'ing', store: 'ingStore' },
        'HorizontalPodAutoscaler': { name: 'hpa', store: 'hpaStore' },
        'Event': { name: 'event', store: 'eventStore' },
        'Role': { name: 'r', store: 'rStore' },
        'RoleBinding': { name: 'rb', store: 'rbStore' },
        'ClusterRole': { name: 'cr', store: 'crStore' },
        'ClusterRoleBinding': { name: 'crb', store: 'crbStore' },
        'LimitRange': { name: 'limits', store: 'limitsStore' },
        'ResourceQuota': { name: 'quota', store: 'quotaStore' },
        'Endpoints': {}
    }

    store = (name) => {
        if (this.storeMap[name] && this[this.storeMap[name].store]) {
            return this[this.storeMap[name].store]
        } else {
            let store
            for (let key in this.storeMap) {
                let o = this.storeMap[key]
                if (o.name === name) {
                    store = this[o.store]
                }
            }
            return store
        }

    }

    shortName = (kind) => {
        console.log(kind);
        return this.storeMap[kind].name
    }

    list = (kind) => {
        let store = this.store(kind)
        return store.list
    }

    element = (kind) => {
        let store = this.store(kind)
        return store.currentElement
    }


}

