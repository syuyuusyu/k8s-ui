import React, { Component } from 'react';
import { Form, Input, Button, Space, Select } from 'antd';
const { Option } = Select
import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';
import { toJS } from 'mobx'
import { inject, observer } from 'mobx-react';
import { runInAction, trace } from 'mobx';

const layout = {

    labelCol: { span: 4 },
    wrapperCol: { span: 14 },
};


@inject('rootStore')
@observer
class PodForm extends Component {

    save = () => {

    }

    error = () => {

    }

    render() {
        const store = this.props.rootStore.store('pod');
        trace()
        return (
            <Form
                {...layout}
                name="basic"
                initialValues={{ remember: true }}
                onFinish={this.save}
                onFinishFailed={this.error}
            >
                <Form.Item
                    label="name"
                    name="name"
                    rules={[{ required: true, message: 'Please input pod name' }]}
                >
                    <Input />
                </Form.Item>

                <div>
                    <Button
                        type="dashed"
                        onClick={() => {
                            store.addVolume()
                        }}
                        block
                    >
                        <PlusOutlined /> Add volume
                    </Button>
                    {
                        store.createVolumeList.map((v, index) => {
                            return (
                                <Space key={index} style={{ display: 'flex', marginBottom: 4 }} align="start">
                                    <Form.Item
                                        label="volume name"
                                        name={[index, 'vanme']}
                                        rules={[{ required: true }]}
                                    >
                                        <Input />
                                    </Form.Item>
                                    <Form.Item
                                        label="volume kind"
                                        name={[index, 'kname']}
                                        rules={[{ required: true }]}
                                    >
                                        <Select style={{ width: 200 }} onChange={store.changeKind(index)}>
                                            <Option value="cm">configMap</Option>
                                            <Option value="pvc">persistentVolumeClaim</Option>
                                            <Option value="secret">secret</Option>
                                        </Select>
                                    </Form.Item>
                                    <Form.Item
                                        label="resourceName"
                                        name={[index, 'rname']}
                                        rules={[{ required: true }]}
                                    >
                                        <Select style={{ width: 200 }} >
                                            {
                                                v.resourceNames.map(_ => <Option value={_}>{_}</Option>)
                                            }
                                        </Select>
                                    </Form.Item>
                                    <MinusCircleOutlined
                                        onClick={() => {
                                            store.removeVolume(index)
                                        }}
                                    />
                                </Space>
                            )
                        })
                    }
                </div>


            </Form>
        )
    }
}

export default PodForm