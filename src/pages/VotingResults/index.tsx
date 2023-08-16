import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from "axios";
import MarkdownIt from 'markdown-it';
import { isFinishVote } from "../../hooks/aleo";
// @ts-ignore
import { fieldLen } from '../../utils';


const mdParser = new MarkdownIt(/* Markdown-it options */);

const VotingResults = () => {

  let { state } = useLocation();
  const navigate = useNavigate();

  const [data, setData] = useState({
    Total: 0,
    data: {} as any,
    option: []
  })

  useEffect(() => {
    const account = localStorage.getItem('account');
    if (account) {
      // @ts-ignore
      isFinishVote(state.pid)?.then(async (res) => {
        const { data } = await axios.get(`http://103.1.65.126:9999/get/${res?.slice(0, -fieldLen)}`);  //每一项投票的pid 取调取数据库获取具体数据
        const result = data.data.text.split(",").reduce((acc: any, curr: any) => {
          const [key, value] = curr.split("=");
          acc.push({ key, value: Number(value) });
          return acc;
        }, [])
        const length = result.reduce((prev: any, curr: any) => prev + curr.value, 0);
        console.log(length)
        setData({ ...data, Total: length, option: result });
      })?.catch((err) => {
        console.log(err);
      })
    }
  }, [state.pid])

  return (
    /*<Table title='View Poll' list={list} />*/
    <div className='voting-result flex'>
      <div className='relative w-full lg:w-8/12 pr-10'>
        <div className='mb-6 px-3 md:px-0'>
          <button>
            <div className='flex items-center'>
              <svg className='mr-1' viewBox="0 0 24 24" width="1.2em" height="1.2em"><path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m11 17l-5-5m0 0l5-5m-5 5h12"></path></svg>
              <div onClick={() => navigate(-1)}>Back</div>
            </div>
          </button>
        </div>
        <div className='px-3 md:px-0'>
          <h1 className='break-words text-3xl text-white leading-12 mb-6'>
            {state.Name}
          </h1>
          <div className='mb-6 flex justify-between'>
            <div className='mb-1 flex items-center sm:mb-0'>
              <button className='bg-[#6D28D9] h-[26px] px-[12px] text-white rounded-xl mr-4'>
                Completed
              </button>
            </div>
            <div className='flex grow items-center space-x-1'>

            </div>
          </div>
          <div className='relative text-lg'>
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
          <div className='border-y border-skin-border bg-skin-block-bg text-base md:rounded-xl md:border border-solid'>
            <div className='group flex h-[57px] justify-between rounded-t-none border-b border-skin-border border-solid px-4 pb-[12px] pt-3 md:rounded-t-lg'>
              <h4 className='flex items-center text-xl'>
                <div>Vote</div>
              </h4>
              <div className='flex items-center'></div>
            </div>
            <div className='p-4 leading-6 sm:leading-8'>
              <div className='space-y-3'>
                {
                  data.option?.map((item: any) => {
                    return (
                      <div key={item.key}>
                        <div className='mb-1 flex justify-between text-skin-link'>
                          <div className='flex overflow-hidden'>
                            <span className='mr-1 truncate'>{item.key}</span>
                          </div>
                          <div className='flex justify-end'>
                            <div className='space-x-2'>
                              <span className='whitespace-nowrap'>{item.value} Vote</span>
                              <span>({(item.value / data.Total) * 100}%)</span>
                            </div>
                          </div>
                        </div>
                        <div className='relative h-2 rounded bg-[#1B2331]'>
                          {
                            item.value ?
                              <div
                                className='absolute top-0 left-0 h-full rounded bg-[#384AFF]'
                                style={{
                                  width: `${(item.value / data.Total) * 100}%`
                                }}
                              /> :
                              <div
                                className='absolute top-0 left-0 h-full rounded bg-[#273141]'
                                style={{
                                  width: '100%'
                                }}
                              />
                          }

                        </div>
                      </div>
                    )
                  })
                }
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default VotingResults
