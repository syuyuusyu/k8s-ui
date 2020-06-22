import { observable, configure, action, runInAction, computed, toJS, reaction } from 'mobx';
import YAML from 'yaml';
import { EventSourcePolyfill } from 'event-source-polyfill';
import { notification } from 'antd'
import { createBrowserHistory } from 'history';

import { host } from '../../config/api';
import { get, put, del } from '../../config/util'
import { BaseStore } from '../store'



configure({ enforceActions: 'observed' });

export default class PodStore extends BaseStore {
    kind = 'Pod'

}
