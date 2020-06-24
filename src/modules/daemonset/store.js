import { observable, configure, action, runInAction, computed, toJS, reaction } from 'mobx';
import { notification } from 'antd'
import YAML from 'yaml';

import { host } from '../../config/api';
import { get, put } from '../../config/util'


import { ControllerStore } from '../commonStore'

configure({ enforceActions: 'observed' });

export default class DsStore extends ControllerStore {
    kind = 'DaemonSet'
}