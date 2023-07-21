import React, { useEffect, useState } from "react"
import { Alert, Spin } from "antd"
import ListFilter from "../../components/ListFilter"
import { useNavigate } from "react-router-dom";
import { walletConnected, getVotingList, isFinishVote } from '../../hooks/aleo';
// @ts-ignore
import { encodeBs58, decodeBs58, ALL_STATUS, IN_PROGRESS_STATUS, VOTE_COUNTING_STATUS, COMPLETED_STATUS } from '../../utils';
import axios from "axios";
// @ts-ignore
import nftStorage from "../../utils/storeNFT.js"

const voteStatusList = [
  {
    label: "All",
    value: ALL_STATUS
  },
  {
    label: "In Progress",
    value: IN_PROGRESS_STATUS
  },
  {
    label: "Vote Counting",
    value: VOTE_COUNTING_STATUS
  },
  {
    label: "Completed",
    value: COMPLETED_STATUS
  }
]

export default function Home() {
  const navigate = useNavigate()
  const [originVotingList, setOriginVotingList] = useState<any>([])
  const [votingList, setVotingList] = useState<any>([])
  const [visible, setVisible] = useState(false)
  const [loading, setLoading] = useState(true)

  const [voteStatus, setVoteStatus] = useState(0)

  useEffect(() => {
    getIpfsCid()
  }, [])

  const getIpfsCid = async () => {
    if (getVotingList) {
      const pidRes = await getVotingList();
      console.log(pidRes);
      const resultList: any = await Promise.all(
        pidRes.map((item: any) => axios.get(`/api/get/${item.id}`))
      );
      const ids = resultList.map((res: any, index: number) => {
        return {
          ...res.data.data,
          pid: pidRes[index].pid
        }
      });
      const list = await getList(ids) || [];

      setLoading(false)
      setOriginVotingList(list)
      setVotingList(list)
    }
  }
  const getList = async (prop: any) => {
    setLoading(true)
    const ipfsUrls = prop.map(
      (_item: any) => _item.text ? `https://${_item.text}.ipfs.nftstorage.link/` : ''
    )
    try {
      const responses: any = await Promise.all(
        ipfsUrls.map((url: string) => axios.get(url))
      )
      console.log(responses)
      const results = []
      for (let i = 0; i < responses.length; i++) {
        if (!responses[i].data.string) {
          results.push({ Time: 123 });
        } else {
          const isFinish = await isFinishVote(prop[i].pid);
          const now = new Date().getTime();
          let voteStatus = null;
          if (now <= responses[i].data.string.Time) {
            voteStatus = IN_PROGRESS_STATUS;
          } else if (isFinish) {
            voteStatus = COMPLETED_STATUS;
          } else {
            voteStatus = VOTE_COUNTING_STATUS;
          }
          results.push({
            ...responses[i].data.string,
            blockHeight: prop[i]['blockHeight'],
            pid: prop[i].pid,
            isFinishVote: isFinish,
            voteStatus
          })
        }

      }
      console.log(results);
      return results
    } catch (error) {
      console.error(error)
    }
  }

  const onVoteStatusChange = (value: number) => {
    setVoteStatus(value)
    const now = new Date().getTime();
    switch (value) {
      case ALL_STATUS:
        setVotingList(originVotingList)
        break
      case IN_PROGRESS_STATUS:
        setVotingList(originVotingList.filter((item: any) => now < item.Time))
        break
      case VOTE_COUNTING_STATUS:
        setVotingList(originVotingList.filter((item: any) => now >= item.Time && !item.isFinishVote))
        break
      case COMPLETED_STATUS:
        setVotingList(originVotingList.filter((item: any) => now >= item.Time && item.isFinishVote))
        break
    }
  }

  const handlerNavigate = async (path: string, params?: any) => {
    const isConnected = await walletConnected();
    if (isConnected) {
      params ? navigate(path, params) : navigate(path)
    } else {
    }
  }

  const closeMessage = () => {
    setTimeout(() => {
      setVisible(false)
    }, 10000)
  }

  /**
   * 跳转处理
   * @param item
   */
  const handleJump = (item: any) => {
    console.log(item);
    const router = `/${item.voteStatus === COMPLETED_STATUS ? "votingResults" : "vote"}/${item.pid}`;
    handlerNavigate(router, { state: item });
  }

  const renderList = (item: any) => {
    return (
      <div
        key={item.Time}
        className="rounded-xl border border-[#313D4F] bg-[#273141] px-[30px] py-[12px] mb-8"
      >
        <div className="flex justify-between items-center mb-3">
          <div className='text-[#8B949E] text-sm'>
            <span className="mr-2">Expiration Time:</span>{new Date(item.Time).toLocaleString()}
          </div>
          <div
            className={`${["bg-green-700", "bg-yellow-700", "bg-[#6D28D9]"][item.voteStatus - 1]} h-[26px] px-[12px] text-white rounded-xl`}>
            {
              ["In Progress", "Vote Counting", "Completed"][item.voteStatus - 1]
            }
          </div>
        </div>
        <div className="relative mb-4 break-words pr-[80px] leading-7 cursor-pointer" onClick={() => {
          handleJump(item)
        }}>
          <h3 className="inline pr-2 text-2xl font-semibold text-white">
            {item.Name}
          </h3>
        </div>
        <div className="mb-2 line-clamp-2 break-words text-lg cursor-pointer" onClick={() => {
          handleJump(item)
        }}>
          {item.Descriptions}
        </div>
        {
          item.voteStatus ===11 &&
          <div>
            <div className="relative mt-1 w-full">
              <div className="absolute ml-3 flex items-center leading-[43px] text-white">
                <svg viewBox="0 0 24 24" width="1.2em" height="1.2em" className="-ml-1 mr-2 text-sm">
                  <path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m5 13l4 4L19 7"></path>
                </svg>
                Yes <span className="ml-1 text-skin-text">13K FIL Vote</span></div>
              <div className="absolute right-0 mr-3 leading-[40px] text-white">99.44%</div>
              <div className="h-[40px] rounded-md bg-[#1b2331]" style={{ width: '99.4429%' }}></div>
            </div>
            <div className="relative mt-1 w-full">
              <div className="absolute ml-3 flex items-center leading-[43px] text-white"> No <span
                className="ml-1 text-skin-text">71 FIL Vote</span></div>
              <div className="absolute right-0 mr-3 leading-[40px] text-white">0.56%</div>
              <div className="h-[40px] rounded-md bg-[#1b2331]" style={{ width: '0.557081%' }}></div>
            </div>
          </div>
        }
      </div>
    )
  }

  return (
    <div className="home_container main">
      {visible ? (
        <Alert
          style={{ marginBottom: "10px", fontSize: "16px" }}
          banner={true}
          message="Need to wait for the transaction to be chained!"
          type="warning"
        />
      ) : (
        ""
      )}

      <h3 className="mb-6 text-2xl text-[#7F8FA3] hover:opacity-80">Vote List</h3>
      <div className="flex justify-between items-center rounded-xl border border-[#313D4F] bg-[#273141] mb-8 px-[30px]">
        <div className="flex justify-between">
          <ListFilter
            name="Status"
            value={voteStatus}
            list={voteStatusList}
            onChange={onVoteStatusChange}
          />
        </div>
        <button
          className="h-[40px] bg-sky-500 hover:bg-sky-700 text-white py-2 px-4 rounded-xl"
          onClick={() => {
            handlerNavigate("/createpoll")
          }}
        >
          Create A Proposal
        </button>
      </div>
      {
        loading ?
          <div className="h-[120px] flex justify-center items-center">
            <Spin />
          </div> :
          <>
            {
              votingList.map((item: any) => {
                return renderList(item)
              })
            }
          </>
      }
    </div>
  )
}
