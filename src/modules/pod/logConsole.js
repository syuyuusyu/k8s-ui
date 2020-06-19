/* eslint-disable */
import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import { EventSourcePolyfill } from 'event-source-polyfill';
import { UnControlled as CodeMirror } from 'react-codemirror2';
//import 'codemirror/mode/verilog/verilog';
import 'codemirror/mode/diff/diff';
//
import 'codemirror/addon/hint/show-hint.css';
import 'codemirror/addon/hint/show-hint.js';
// import 'codemirror/addon/hint/javascript-hint.js';
import 'codemirror/lib/codemirror.css';
import 'codemirror/theme/material.css';
import 'codemirror/theme/ambiance.css';
import '../codeMirrorStyle.css';

import { host } from '../../config/api'


@inject('rootStore')
@observer
class LogConsole extends Component {

    state = {
        logText: ''
    }
    componentDidMount() {
        this.loadLogs();
        const editor = (document.getElementsByClassName('CodeMirror-sizer'))[0];
        editor.setAttribute('id', 'editor');
        console.log(editor);
        this.timer = setInterval(() => {
            document.getElementById('editor').scrollIntoView(false); // 滚动日志窗口到底部
        }, 1000)
    }


    loadLogs = () => {
        const pod = this.props.rootStore.podStore.currentElement
        this.logEventSource = new EventSourcePolyfill(`${host}/kube/watch/log/${pod.metadata.namespace}/${pod.metadata.name}/${this.props.containerName}`, {
            headers: {
                'access-token': sessionStorage.getItem('access-token') || ''
            }
        });
        this.logEventSource.onmessage = result => {
            if (result && result.data) {
                //console.log(result.data);
                this.setState({ logText: this.state.logText + result.data });
            }


        };

        this.logEventSource.onerror = err => {
            console.log('EventSource error: ', err);
        };
    }


    componentWillUnmount() {
        if (this.logEventSource) {
            this.logEventSource.close();
        }
        this.timer && clearTimeout(this.timer);
    }

    render() {
        return (
            <div className={'pod'}>
                <CodeMirror
                    value={this.state.logText}
                    options={
                        {
                            mode: 'diff',
                            theme: 'material',
                            lineNumbers: true,
                        }
                    }
                />
            </div>
        );
    }
}


export default LogConsole;