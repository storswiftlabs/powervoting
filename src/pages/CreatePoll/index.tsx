import React, { useState, useEffect } from "react";
import 'katex/dist/katex.min.css';
import {message,} from "antd"
// @ts-ignore
import nftStorage from "../../utils/storeNFT.js"
import { RangePickerProps } from "antd/es/date-picker/index"
import dayjs from "dayjs"
import { useNavigate } from "react-router-dom"
import Table from '../../components/Table';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { TrashIcon } from '@heroicons/react/24/outline'
import classNames from 'classnames';
import { RadioGroup } from '@headlessui/react';
import useSWR from 'swr';
import axios from 'axios';
// @ts-ignore
import { encodeBs58 } from '../../utils';
import MarkdownIt from 'markdown-it';
import MdEditor from 'react-markdown-editor-lite';
// @ts-ignore
import { walletConnected, createPropose } from '../../hooks/aleo';

import 'react-markdown-editor-lite/lib/index.css';
import './index.less';
import { useStore } from "../../lib/context"

const mdParser = new MarkdownIt(/* Markdown-it options */);

const pollTypes = [
  {
    label: 'Single Answer',
    value: 1
  },
  {
    label: 'Multiple Answers',
    value: 2
  }
]

const CreatePoll = () => {
  const [descriptions, setDescriptions] = useState('');
  const [state, dispatch] = useStore();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors }
  }: any = useForm({
    defaultValues: {
      VoteType: 1,
      option: [{ value: '' }]
    }
  })

  // ts-ignore
  const { fields, append, remove } = useFieldArray({
    name: 'option',
    control,
    rules: {
      required: true
    }
  })

  const navigate = useNavigate()

  const [loading, setLoading] = useState<boolean>(false);

  const range = (start: number, end: number) => {
    const result = []
    for (let i = start; i < end; i++) {
      result.push(i)
    }
    return result
  }

  const disabledDate: RangePickerProps["disabledDate"] = (current) => {
    // Can not select days before today and today
    return current && current < dayjs()
  }

  const disabledDateTime = () => ({
    disabledHours: () => range(0, 24).splice(4, 20),
    disabledMinutes: () => range(30, 60),
    disabledSeconds: () => [55, 56],
  })

  const onSubmit = async (values:any) => {
    if (values.option?.length <= 0) {
      message.error("Please confirm if you want to add a voting option");
    } else {
      setLoading(true)
      const timestamp = new Date(values.Time).getTime();

      const _values = {
        ...values,
        Descriptions: descriptions,
        Time: timestamp,
        option: values.option.map((item: any) => item.value),
        Address: state.currentAddress,
      };
      console.log(_values);
      const cid = await nftStorage(_values);
      const { data } = await axios.post(`/api/update`, { text: cid });
      console.log('create vote params: ' + data?.id);
      return false;
      if (data?.id) {
        message.success("Waiting for the transaction to be chained!")
        // console.log(cid)
        if (state.currentAddress) {
          // @ts-ignore
          const res = await createPropose(data?.id);
          // console.log(res, "res")
          if (res) {
            setLoading(false)
            message.success("Preparing to wind the chain!");
            navigate("/", { state: true })
          }
        }
      }
    }
  }

  const handleEditorChange = (data: { text: string, html: string }) => {
    setDescriptions(data.text);
  }

  const list = [
    {
      name: 'Proposal Title',
      comp: (
        <>
          <input
            name='Name'
            className={classNames(
              'form-input w-full rounded bg-[#212B3C] border border-[#313D4F]',
              errors['Name'] && 'border-red-500 focus:border-red-500'
            )}
            placeholder='Proposal Title'
            {...register('Name', { required: true })}
          />
          {errors['Name'] && (
            <p className='text-red-500 mt-1'>Proposal Title is required</p>
          )}
        </>
      )
    },
    {
      name: 'Proposal Description',
      comp: <MdEditor style={{ height: '500px' }} renderHTML={value => mdParser.render(value)} onChange={handleEditorChange} />
    },
    {
      name: 'Proposal Expiration Time',
      comp: (
        <div className='flex items-center'>
          <div className='mr-2.5'>
            <input
              name='Time'
              type='datetime-local'
              className={classNames(
                'form-input rounded bg-[#212B3C] border border-[#313D4F] w-[248px]',
                errors['Time'] && 'border-red-500 focus:border-red-500'
              )}
              placeholder='Pick Date'
              {...register('Time', { required: true })}
            />
            {errors['Time'] && (
              <p className='text-red-500 mt-1'>Please Pick Start Date</p>
            )}
          </div>
        </div>
      )
    },
    {
      name: 'Proposal Type',
      comp: (
        <Controller
          name='VoteType'
          control={control}
          render={({ field: { onChange, value } }) => {
            return (
              <RadioGroup className='flex' value={value} onChange={onChange}>
                {pollTypes.map(poll => (
                  <RadioGroup.Option
                    key={poll.label}
                    value={poll.value}
                    className={
                      'relative flex items-center cursor-pointer p-4 focus:outline-none'
                    }
                  >
                    {({ active, checked }) => (
                      <>
                        <span
                          className={classNames(
                            checked
                              ? 'bg-[#45B753] border-transparent'
                              : 'bg-[#212B3B] border-[#38485C]',
                            active ? 'ring-2 ring-offset-2 ring-[#45B753]' : '',
                            'mt-0.5 h-4 w-4 shrink-0 cursor-pointer rounded-full border flex items-center justify-center'
                          )}
                          aria-hidden='true'
                        >
                          {(active || checked) && (
                            <span className='rounded-full bg-white w-1.5 h-1.5' />
                          )}
                        </span>
                        <span className='ml-3'>
                          <RadioGroup.Label
                            as='span'
                            className={
                              checked ? 'text-white' : 'text-[#8896AA]'
                            }
                          >
                            {poll.label}
                          </RadioGroup.Label>
                        </span>
                      </>
                    )}
                  </RadioGroup.Option>
                ))}
              </RadioGroup>
            )
          }}
        />
      )
    },
    {
      name: 'Proposal Options',
      comp: (
        <>
          <div className='rounded border border-[#313D4F] divide-y divide-[#212B3C]'>
            <div className='flex justify-between bg-[#293545] text-base text-[#8896AA] px-5 py-4'>
              <span>Options</span>
              <span>Operations</span>
            </div>
            {fields.map((field: any, index:number) => (
              <div key={field.id}>
                <div className='flex items-center pl-2.5 py-2.5 pr-5'>
                  <input
                    type='text'
                    className={classNames(
                      'form-input flex-auto rounded bg-[#212B3C] border border-[#313D4F]',
                      errors[`option.${index}.value`] &&
                      'border-red-500 focus:border-red-500'
                    )}
                    placeholder='Edit Option'
                    {...register(`option.${index}.value`, { required: true })}
                  />
                  {
                    fields.length > 1 &&
                    <button
                      type='button'
                      onClick={() => remove(index)}
                      className='ml-3 w-[50px] h-[50px] flex justify-center items-center bg-[#212B3C] rounded-full'
                    >
                      <TrashIcon className='h-5 w-5 text-[#8896AA] hover:opacity-80' />
                    </button>
                  }
                </div>
                {errors[`option.${index}.value`] && (
                  <div className='px-2.5 pb-3'>
                    <p className='text-red-500 text-base'>
                      This field is required
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
          {errors.option?.root && (
            <div className='px-2.5 py-3'>
              <p className='text-red-500 text-base'>Please add some options</p>
            </div>
          )}
          {
            fields.length <= 9 &&
            <div className='pl-2.5 py-4'>
              <button
                type='button'
                onClick={() => append('')}
                className='px-8 py-3 rounded border border-[#313D4F] bg-[#3B495B] text-base text-white hover:opacity-80'
              >
                Add Option
              </button>
            </div>
          }
        </>
      )
    }
  ]

  useEffect(() => {
    console.log(errors)
  }, [errors])

  return (
    /*<div>
      <Form
        layout="vertical"
        onFinish={onFinish}
        onFinishFailed={onFinishFailed}
        labelCol={{ span: 12 }}
        wrapperCol={{ span: 24 }}
      >
        <Form.Item
          name="Name"
          label="Name"
          rules={[{ required: true, message: "Please enter the name!" }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          name="Description"
          label="Description"
          rules={[{ required: true, message: "Please enter the Description!" }]}
        >
          <TextArea rows={4} />
        </Form.Item>

        <div
          style={{ cursor: "pointer" }}
          onClick={() => {
            setOpen(true)
          }}
        >
          Add Option <PlusCircleOutlined />
        </div>
        <Form.Item label="options:">
          <Radio.Group>
            <Space direction="vertical">
              {radio.map((item: any, index: any) => {
                return <div key={index}>{" " + item}</div>
              })}
            </Space>
          </Radio.Group>
        </Form.Item>
        <Form.Item
          name={"Time"}
          label="Closing Time"
          rules={[
            {
              required: true,
              message: "Please enter your Number of Closing Time!",
            },
          ]}
        >
          <DatePicker
            showTime={{ format: "HH:mm" }}
            format="YYYY-MM-DD HH:mm"
            // disabledDate={disabledDate}
          />
        </Form.Item>

        <Form.Item>
          <Button
            loading={loading}
            htmlType="submit"
            style={{ background: "#e99d42", width: "100%" }}
          >
            Submit
          </Button>
        </Form.Item>
      </Form>

      <>
        <CollectionCreateForm
          open={open}
          onCreate={onCreate}
          onCancel={() => {
            setOpen(false)
          }}
          loading={loading}
        />
      </>
    </div>*/
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className='flow-root space-y-8'>
        <Table title='Create A Proposal' list={list} />

        <div className='text-center'>
          <button className="h-[40px] bg-sky-500 hover:bg-sky-700 text-white py-2 px-6 rounded-xl" type='submit' disabled={loading}>
            Create
          </button>
        </div>
      </div>
    </form>
  )
}

export default CreatePoll
