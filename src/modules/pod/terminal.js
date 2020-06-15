/* eslint-disable */
import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import { Terminal } from 'xterm';
import { Select } from 'antd';
const { Option } = Select;
import "xterm/css/xterm.css";
import { wsUrl } from '../../config/api'


@inject('rootStore')
@observer
class TerminalConsole extends Component {

    ws;
    xterm = new Terminal({
        cols: 200,
        rows: 40,
        cursorBlink: 5,
        scrollback: 30,
        tabStopWidth: 4
    });

    componentWillUnmount() {
        if (this.ws)
            this.ws.close();
    }

    componentDidMount() {
        this.openterminal()
    }

    openterminal() {
        const store = this.props.rootStore.podStore;
        let url = `${wsUrl}?access-token=${sessionStorage.getItem('access-token') || 'notoken'}&ns=${store.rootStore.columnStore.currentNamespace}&name=${store.currentElement.metadata.name}`;
        if (this.props.containerName) {
            url = `${url}&container=${this.props.containerName}`;
        }
        this.ws = new WebSocket(url);
        this.xterm.open(document.getElementById(`terminal${this.props.containerName}`));
        this.ws.onerror = function () {
            //showErrorMessage('connect error.')
        };
        this.ws.onmessage = (e) => {
            if (e.data instanceof Blob) {
                var f = new FileReader();
                f.onload = () => {
                    this.xterm.write(f.result);
                };
                f.readAsText(e.data);
            } else {
                this.xterm.write(e.data);
            }
        };
        this.ws.onopen = (event) => {
            console.log('onopen');
            this.ws.send(String.fromCharCode(13));

        };

        this.xterm.textarea.onkeydown = (e) => {
            //console.log('User pressed key with keyCode: ', e.keyCode);

        };

        this.xterm.attachCustomKeyEventHandler((e) => {

        });
        this.xterm.onData((data) => {
            this.ws.send(data)
        });

        this.xterm.onResize(size => {
            this.ws.send('resize', [size.cols, size.rows]);
            console.log('resize', [size.cols, size.rows]);
        })
    }



    render() {
        // const store = this.props.rootStore.podStore
        // const pod = store.currentElement
        return (< div >
            <div id={`terminal${this.props.containerName}`} ></div>
        </div >
        );
    }
}

export default TerminalConsole