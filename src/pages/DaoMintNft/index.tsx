import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { Tooltip, message } from 'antd';
import Table from "src/components/Table";
import { RadioGroup } from '@headlessui/react';
import classNames from 'classnames';
import { walletConnected, getRecords, mintPowerVotingApi } from "../../hooks/aleo";
// @ts-ignore
import { MULTI_VOTE } from '../../utils';
import axios from 'axios';



function index() {
  const [recordList, setRecordList] = useState([]);
  const navigate = useNavigate();
  const { state } = useLocation();

  const {
    handleSubmit,
    control,
  } = useForm({
    defaultValues: {
      option: state.VoteType === MULTI_VOTE ? [] : null
    }
  })

  // useEffect(() => {
  //   getRecordList();
  // }, [])

  const handlerNavigate = async (path: string, params?: any) => {
    const isConnected = await walletConnected();
    if (isConnected) {
      params ? navigate(path, params) : navigate(path)
    } else {
    }
  }

  const getRecordList = async () => {
    const res = await getRecords();
    setRecordList(res.result);
  }

  const handleMint = async () => {
    //const res = await mintTokenApi();
    // console.log(res);
    getRecordList();
  }

  const handleMintPower = async (value: any) => {
    if (!value.option) {
      message.warning("Please confirm if you want to vote a option");
      return false;
    } else {
      const { data } = await axios.get('https://vm.aleo.org/api/testnet3/latest/height');
      console.log(value);
      console.log(data);
      return false;
      const res = await mintPowerVotingApi(value.option, data + 100);
      //todo 根据 blockHeight 获取余额
      handlerNavigate(`/vote/${state.pid}`, { state: { ...state, isNft: false, balance: data + 100} });
    }

  }

  const list = [
    {
      name: "DAO",
      comp: 'Power Voting DAO',
    },
    {
      name: 'Mint PVT Tokens',
      comp: (
        <div className='flex flex-col items-center'>
          <p className="text-[#8896AA] mb-12">
            Mint 10 PVT test tokens.After tokens are minted, it will be listed
            in the following Records table and will be used to mint Voting Power.
          </p>
          <button
            type='button'
            onClick={handleMint}
            className='h-[40px] bg-[#6D28D9] hover:bg-[#8b5cf6] text-white text-base py-2 px-4 rounded-full'
          >
            Mint PVT Tokens
          </button>
        </div>
      ),
    },
    {
      name: "Records",
      comp: (
        <div className='space-y-5'>
          <Controller
            name='option'
            control={control}
            render={({ field: { onChange, value } }) => {
              return (
                <RadioGroup
                  value={value}
                  onChange={onChange}
                >
                  {recordList?.map((item: any) => (
                    <RadioGroup.Option
                      key={item.record}
                      value={item.record}
                      className={
                        'relative flex items-center cursor-pointer p-2 focus:outline-none'
                      }
                    >
                      {({ active, checked }) => (
                        <>
                            <span
                              className={classNames(
                                checked
                                  ? 'bg-[#45B753] border-transparent'
                                  : 'bg-[#212B3B] border-[#38485C]',
                                active
                                  ? 'ring-2 ring-offset-2 ring-[#45B753]'
                                  : '',
                                'mt-0.5 h-4 w-4 shrink-0 cursor-pointer rounded-full border flex items-center justify-center'
                              )}
                              aria-hidden='true'
                            >
                              {(active || checked) && (
                                <span className='rounded-full bg-white w-1.5 h-1.5' />
                              )}
                            </span>
                          <span className='ml-3 flex items-center'>
                                <RadioGroup.Label
                                  as='span'
                                  className={`${checked} ? 'text-white' : 'text-[#8896AA]' mr-2`}
                                >
                                  {item.programID}
                                </RadioGroup.Label>
                                <Tooltip title={item.record}>
                                  <svg viewBox="64 64 896 896" focusable="false" data-icon="copy" width="1em" height="1em" fill="currentColor" aria-hidden="true"><path d="M832 64H296c-4.4 0-8 3.6-8 8v56c0 4.4 3.6 8 8 8h496v688c0 4.4 3.6 8 8 8h56c4.4 0 8-3.6 8-8V96c0-17.7-14.3-32-32-32zM704 192H192c-17.7 0-32 14.3-32 32v530.7c0 8.5 3.4 16.6 9.4 22.6l173.3 173.3c2.2 2.2 4.7 4 7.4 5.5v1.9h4.2c3.5 1.3 7.2 2 11 2H704c17.7 0 32-14.3 32-32V224c0-17.7-14.3-32-32-32zM350 856.2L263.9 770H350v86.2zM664 888H414V746c0-22.1-17.9-40-40-40H232V264h432v624z"></path></svg>
                                </Tooltip>
                            </span>
                        </>
                      )}
                    </RadioGroup.Option>
                  ))}
                </RadioGroup>
              )
            }}
          />
        </div>
      ),
    },
  ]

  return (
    <div className="flow-root space-y-8">
      <form onSubmit={handleSubmit(handleMintPower)} className='flow-root space-y-8'>
        <Table
          tdCss={{ border: "1px solid #313d4f" }}
          title="View Poll"
          list={list}
        />
        <div className="text-center">
          <button type='submit' className='h-[40px] bg-[#6D28D9] hover:bg-[#8b5cf6] text-white text-base py-2 px-4 rounded-full mt-6'>
            Mint Voting Power
          </button>
        </div>
      </form>
    </div>
  )
}

export default index
