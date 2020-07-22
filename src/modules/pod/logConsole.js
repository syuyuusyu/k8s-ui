/* eslint-disable */
import React, { Component } from "react";
import { inject, observer } from "mobx-react";
import { EventSourcePolyfill } from "event-source-polyfill";
//import 'codemirror/mode/verilog/verilog';
import "codemirror/mode/diff/diff";
//
import "codemirror/addon/hint/show-hint.css";
import "codemirror/addon/hint/show-hint.js";
// import 'codemirror/addon/hint/javascript-hint.js';
import "codemirror/lib/codemirror.css";
import "codemirror/theme/material.css";
import "codemirror/theme/ambiance.css";
import "../codeMirrorStyle.css";

import { host } from "../../config/api";

@inject("rootStore")
@observer
class LogConsole extends Component {
    state = {
        logText: "",
    };

    componentDidMount() {
        this.loadLogs();
    }


    loadLogs = () => {
        const pod = this.props.rootStore.podStore.currentElement;
        this.logEventSource = new EventSourcePolyfill(
            `${host}/kube/watch/log/${pod.metadata.namespace}/${pod.metadata.name}/${this.props.containerName}`,
            {
                headers: {
                    "access-token": sessionStorage.getItem("access-token") || "",
                },
            }
        );
        var x = document.getElementById("code-mirror-editor");
        this.logEventSource.onmessage = (result) => {
            if (result && result.data) {
                //console.log(result.data);
                this.setState({ logText: this.state.logText + "<br/>" + result.data });
                (function (_x) {
                    _x.scrollTo(0, _x.scrollHeight);
                })(x)
            }
        };

        this.logEventSource.onerror = (err) => {
            console.log("EventSource error: ", err);
        };
    };

    componentWillUnmount() {
        if (this.logEventSource) {
            this.logEventSource.close();
        }
        this.timer && clearTimeout(this.timer);
    }

    render() {
        return (
            <div className={"pod"} style={{ width: "100%" }}>
                {/*<CodeMirror*/}
                {/*    value={this.state.logText}*/}
                {/*    options={*/}
                {/*        {*/}
                {/*            mode: 'diff',*/}
                {/*            theme: 'material',*/}
                {/*            lineNumbers: true,*/}
                {/*        }*/}
                {/*    }*/}
                {/*/>*/}

                <div
                    style={{ lineHeight: '32px' }}
                    className={`CodeMirror-sizer`}
                    id="code-mirror-editor"
                    dangerouslySetInnerHTML={{ __html: this.state.logText }}
                    style={{
                        paddingTop: "10px",
                        paddingLeft: "30px",
                        paddingRight: "30px",
                        margin: "0",
                        border: "0",
                        background: "rgba(0, 0, 0)",
                        color: "white",
                        minHeight: "70vh",
                        height: "70vh",
                        width: "100%",
                        overflow: "scroll",
                    }}
                >
                    {/*{this.state.logText}*/}
                    {/*{this.state.logText}*/}
                </div>
            </div>
        );
    }
}

export default LogConsole;
