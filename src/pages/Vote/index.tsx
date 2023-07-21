import { message } from "antd";
import React, { useState, useEffect } from "react";
import { useLocation, useNavigate  } from "react-router-dom";
import { useForm, Controller } from 'react-hook-form';
import { RadioGroup } from '@headlessui/react';
import classNames from 'classnames';
// @ts-ignore
import nftStorage from "../../utils/storeNFT";
import { voteApi, walletConnected, getVoteId, getVoteOption, countApi } from "../../hooks/aleo"
// @ts-ignore
import { encodeBs58, host, programID, idUnitLen, IN_PROGRESS_STATUS, MULTI_VOTE } from '../../utils';
import MarkdownIt from 'markdown-it';
import axios from 'axios';

const mdParser = new MarkdownIt(/* Markdown-it options */);

const Vote = () => {
  const { state } = useLocation();
  console.log(state)
  const navigate = useNavigate();
  const [options, setOptions] = useState([] as any);
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors }
  } = useForm({
    defaultValues: {
      option: state.VoteType === MULTI_VOTE ? [] : null
    }
  })

  useEffect(() => {
    const fetchData = async () => {
      const res = await walletConnected();
      setConnected(res);
    }
    fetchData();
  }, [])

  const startCounting = async () => {

    if (connected) {
     setLoading(true)
      const { pid } = state
      const res = await getVoteId(pid);
      const voteCount = res?.slice(0, -idUnitLen);
      const ids = Array.from({ length: voteCount }, (_, i) => i);
      const detailIds = await Promise.all(
        ids.map(
          (id) =>
            new Promise((r) => {
              console.log(`${pid}-${id}`)
              const pVid = encodeBs58(`${pid}-${id}`);
              getVoteOption(pVid).then((id) => r(id))
            })
        )
      )
      const resultList = await Promise.all(
        detailIds.map(async (id) => {
          const res = await axios.get(`/api/get/${id}`);
          return res.data.data;
        }))
      const countOption = handleOptionCount(resultList);
      const strCountOption = countOption.map(obj => `${obj.key}=${obj.value}`).toString();
      const { data } = await axios.post(`/api/update`, { text: strCountOption });
      console.log('count vote params: ' + state.pid, data.id);
      message.success("Waiting for confirmation of transactions", 3);
      // @ts-ignore
      const result = await countApi(state.pid, data.id)

      if (result) {
        setLoading(false)
        message.success("Successful vote counting", 3)
        setTimeout(() => {
          navigate("/")
        }, 3000)
      }
    }
  }

  const handleOptionCount = (list: any[]) => {
    const targetList: any[] = [];
    const total = list.map(item => item.text.split(',')).flat();
    state.option?.map((option: string) => {
      targetList.push({
        key: option,
        value: total.filter(item => item === option)?.length || 0
      })
    });
    return targetList;
  }

  const startVoting = async (values: any) => {
    if (!values.option) {
      message.warning("Please confirm if you want to vote a option");
      return false;
    } else {
      setLoading(true)
      const { pid } = state
      const res = await getVoteId(pid);
      const voteCount = res?.slice(0, -idUnitLen);
      const pVid = `${pid}-${voteCount?.slice(0, -idUnitLen) || '0'}`;
      const option = Array.isArray(values) ? values.filter(item => item.option).join('&') : values.option.toString();
      const { data } = await axios.post(`/api/update`, { text: option });
      console.log('vote params: ' + pid, encodeBs58(pVid), data.id);
      if (connected) {
        // @ts-ignore
        voteApi(pid, pVid, data.id)
          ?.then(() => {
            setLoading(false);
            message.success("Vote successful!", 3)
            setTimeout(() => {
              navigate("/")
            }, 3000)
          })
          ?.catch((error: any) => {
            console.log(error)
            setLoading(false);
            message.warning("A user cannot vote more than once!",3)
            setTimeout(() => {
              navigate("/")
            }, 3000)
          })
      }
    }
  }

  return (
    <>
      <div className='voting flex'>
        <div className='relative w-full lg:w-8/12 pr-10'>
          <div className='mb-6 px-3 md:px-0'>
            <button>
              <div className='inline-flex items-center gap-1 text-skin-text hover:text-skin-link'>
                <div className='flex items-center'>
                  <svg className='mr-1' viewBox="0 0 24 24" width="1.2em" height="1.2em"><path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m11 17l-5-5m0 0l5-5m-5 5h12"></path></svg>
                  <div onClick={() => navigate(-1)}>Back</div>
                </div>
              </div>
            </button>
          </div>
          <div className='px-3 md:px-0'>
            <h1 className='mbreak-words text-3xl text-white leading-12 mb-6'>
              {state.Name}
            </h1>
            <div className='mb-6 flex justify-between'>
              <div className='w-full mb-1 flex justify-between items-center sm:mb-0'>
                <button className={`${state.voteStatus === IN_PROGRESS_STATUS ? "bg-green-700" : "bg-yellow-700"} bg-[#6D28D9] h-[26px] px-[12px] text-white rounded-xl mr-4`}>
                  { state.voteStatus === IN_PROGRESS_STATUS ? 'In Progress' : 'Vote Counting' }
                </button>
              </div>
            </div>
            <div className='relative text-lg break-words'>
              {state.Descriptions}
            </div>
          </div>
        </div>
        <div className='w-full lg:w-4/12 lg:min-w-[321px]'>
          <div className='mt-4 space-y-4 lg:mt-0'>
            <div className='border-y border-skin-border bg-skin-block-bg text-base md:rounded-xl md:border border-solid'>
              <div className='group flex h-[57px] justify-between rounded-t-none border-b border-skin-border border-solid px-4 pb-[12px] pt-3 md:rounded-t-lg'>
                <h4 className='flex items-center text-xl'>
                  <div>Message</div>
                </h4>
                <div className='flex items-center'>

                </div>
              </div>
              <div className='p-4 leading-6 sm:leading-8'>
                <div className='space-y-1'>
                  <div>
                    <b>Vote Type</b>
                    <span className='float-right text-white'>{ ['Single', 'Multiple'][state.VoteType - 1] } choice voting</span>
                  </div>
                  <div>
                    <b>Expiration Time</b>
                    <span className='float-right text-white'>{new Date(state.Time).toLocaleString()}</span>
                  </div>
                  <div>
                    <b>Snapshot</b>
                    <a href='https://filfox.info/zh/tipset/3045516' target="_blank" rel="noopener noreferrer" className='float-right whitespace-nowrap text-white'>
                      3045516
                      <svg viewBox="0 0 24 24" width="1.2em" height="1.2em" className="mb-[2px] ml-1 inline-block text-xs"><path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {
        state.isNft && state.voteStatus === IN_PROGRESS_STATUS &&
        <div className='w-[620px] mt-12'>
          <button
            onClick={() => { navigate('/daoMintNft', { state }) }}
            className='w-full h-[40px] bg-[#6D28D9] hover:bg-[#8b5cf6] text-white py-2 px-6 rounded-full'
          >
            Mint A NFT
          </button>
        </div>
      }
      {
        !state .isNft &&
        <div>
          {
            state.voteStatus === IN_PROGRESS_STATUS ?
              <div className='w-[620px] mt-12 border-y border-skin-border bg-skin-block-bg text-base md:rounded-xl md:border border-solid'
              >
                <div className='group flex h-[57px] justify-between items-center rounded-t-none border-b border-skin-border border-solid px-4 pb-[12px] pt-3 md:rounded-t-lg'>
                  <h4 className='flex items-center text-xl'>
                    <div>Cast your vote</div>
                  </h4>
                  {
                    state.balance &&
                    <div>{ state.balance }(Votes)</div>
                  }
                </div>
                <div className='p-4 text-center'>
                  <form onSubmit={handleSubmit(startVoting)} className='flow-root space-y-8'>
                    {state.VoteType === MULTI_VOTE ? (
                      <div className='space-y-5'>
                        {state.option.map((item: string, index: number) => (
                          <div className='relative flex items-start' key={index}>
                            <div className='flex h-6 items-center'>
                              <input
                                id={item}
                                type='checkbox'
                                value={item}
                                className='h-4 w-4 rounded bg-[#212B3B] border-[#37475B] text-[#45B753] focus:ring-[#45B753]'
                                {...register('option', { required: true })}
                              />
                            </div>
                            <div className='ml-3'>
                              <label htmlFor={item}>
                                {item}
                              </label>
                            </div>
                          </div>
                        ))}
                        {errors['option'] && (
                          <p className='text-red-500 mt-1'>Please vote</p>
                        )}
                      </div>
                    ) : (
                      // @ts-ignore
                      <Controller
                        name='option'
                        control={control}
                        render={({ field: { onChange, value } }) => {
                          return (
                            <RadioGroup
                              disabled={state.bool}
                              value={value}
                              onChange={onChange}
                            >
                              {state.option?.map((item: string) => (
                                <RadioGroup.Option
                                  key={item}
                                  value={item}
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
                                      <span className='ml-3'>
                              <RadioGroup.Label
                                as='span'
                                className={
                                  checked ? 'text-white' : 'text-[#8896AA]'
                                }
                              >
                                {item}
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
                    )}

                    <div className='text-center'>
                      <button onClick={startVoting} className='w-full h-[40px] bg-sky-500 hover:bg-sky-700 text-white py-2 px-6 rounded-full' type='submit' disabled={loading}>
                        Submit
                      </button>
                    </div>
                  </form>
                </div>
              </div>:
              <div className='w-[620px] mt-12'>
                <button onClick={startCounting} className='w-full h-[40px] bg-sky-500 hover:bg-sky-700 text-white py-2 px-6 rounded-full' disabled={loading}>
                  Count
                </button>
              </div>
          }
        </div>
      }
    </>
  )
}

export default Vote;
