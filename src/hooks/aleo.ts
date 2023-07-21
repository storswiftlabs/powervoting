// @ts-ignore
import { encodeBs58, idUnitLen, parseDetail, host, programID, fieldLen } from "../utils";

export async function connectWalletPlugin() {
  // @ts-ignore
  // 将获取到的数据，加密后存入本地
  let account = await window.wallet.features['standard:connect'].connect();
  // 存入本地
  window.localStorage.setItem('account', account.address);
  window.localStorage.setItem('connected', 'true');
  return account;
}

export async function getRecords() {
  // @ts-ignore
  const res = await window.wallet.features['standard:records'].records({ program: programID });
  return res;
}

/**
 * 钱包是否连接
 */
export async function walletConnected() {
  // @ts-ignore
  const connected = window.localStorage.getItem("connected");
  if (connected) {
    return true
  }
  return false;
}

/**
 * 获取当前钱包账户
 * @returns address
 */
export async function walletAccount() {
  // @ts-ignore
  const account = window.localStorage.getItem("account");

  return { address: account || "" };
}

/**
 * 删除storage数据
 */
export async function delectAccount(storageName?: string) {
  if (!storageName) {
  window.localStorage.removeItem("account");
  window.localStorage.removeItem('connected');
} else {
  window.localStorage.removeItem(storageName);
}

}

export async function transfer(params: any) {
  try {
    // @ts-ignore
    let transferRes = await window.wallet.features[
      "standard:transfer"
      ].transfer(params)
    return transferRes
  } catch (e) {
    return ""
  }
}

export async function sign(params:any) {
  try {
    // @ts-ignore
    let signResult = await window.wallet.features["standard:sign"].sign(params)
    return JSON.parse(signResult)
  } catch (e) {
    return ""
  }
}

export async function queryRecords(params: any) {
  try {
    // @ts-ignore
    let queryRecords = await window.wallet.features["standard:records"].records(
      params
    )
    return queryRecords.result || []
  } catch (e) {
    console.log(e)
    return []
  }
}

export async function execute(params:any){
  try {
    // @ts-ignore
    let executeRes = await window.wallet.features['standard:execute'].execute(params);
    return JSON.parse(executeRes);
  } catch (e) { }
}

export const createPropose = async (proposal_cid: string) => {
  return await execute({
    programID,
    functionName: "propose",
    // fee: 10000,
    inputs: [
      [proposal_cid, "field"],
    ]
  })
}

export const getVotingList = async () => {
  const mappingName = "proposal_ids";
  const key = "2074281269322187893875field";
  const api = `${host}/${programID}/mapping/${mappingName}/${key}`;
  const res = await fetch(api).then((res) => res.json());
  const id = +res.slice(0, -idUnitLen)
  const ids = Array.from({ length: id }, (_, i) => i);
  const details = await Promise.all(
    ids.map(
      (id) =>
        new Promise((r) => {
          getDetail(id).then((detail) => r(detail))
        })
    )
  )
  const filterDetails = details.map((v:any, index: number) => {
    return {
      id: v?.slice(0, -fieldLen),
      pid: index
    }
  });
  return filterDetails
}

export const getDetail = async (id: number) => {
  const mappingName = "proposals"
  const key = `${id}u64`
  const api = `${host}/${programID}/mapping/${mappingName}/${key}`
  return await fetch(api).then((res) => res.json());
}

export const getParsedDetail = async (id: number) => {
  const res = await getDetail(id)
  return parseDetail(res)
}

export const getRecord = async () => {
  const param = {
    program: programID
  }
  return await queryRecords(param)
}

export const getVoteId = async (vote_ids: string) => {
  const mappingName = "vote_ids"
  const key = `${vote_ids}u64`;
  const api = `${host}/${programID}/mapping/${mappingName}/${key}`
  return await fetch(api).then((res) => res.json())
}

export const getVoteOption = async (pVid: number) => {
  const mappingName = "votes"
  const key = `${pVid}field`;
  const api = `${host}/${programID}/mapping/${mappingName}/${key}`
  return await fetch(api).then((res) => res.json())
}

export const isFinishVote = async (voteId: string) => {
  const mappingName = "counts"
  // const key = `${counts}u64`;
  const api = `${host}/${programID}/mapping/${mappingName}/${voteId}u64`
  return await fetch(api).then((res) => res.json())
}

// @ts-ignore
export const voteApi = async ({ pid, pvid, vote_options }) => {
  return await execute({
    programID,
    functionName: "vote",
    // fee: 10000,
    inputs: [
      [pid, "u64"],
      [pvid, "field"],
      [vote_options, "field"],
    ]
      .map(([value, type]) => `${encodeBs58(value)}${type}`)
      .join("&&")
  })
}

export const mintTokenApi = async () => {
  // 固定mint10
  return await execute({
    programID,
    functionName: "mint_token",
    inputs: [[10, "u64"]]
      .map(([value, type]) => `${encodeBs58(value)}${type}`)
      .join("&&")
  })
}

// @ts-ignore
export const mintPowerVotingApi = async (pvtoken, withdrawable_block_height) => {
  const name = "power voting token"
  // const amount = 1;
  const symbol = "PVT"
  return await execute({
    programID,
    functionName: "mint_power_by_token",
    inputs: [
      [pvtoken, "PVToken"],
      [withdrawable_block_height, "u32"],
    ].join("&&")
  })
}

export const mintPower = async () => {
  return await execute({
    programID,
    functionName: "mint_power",
    inputs: ""
  })
}

// @ts-ignore
export const countApi = async ({ pid, option_counts }) => {
  return await execute({
    programID,
    functionName: "count",
    inputs: [
      [pid, "u64"],
      [option_counts, "field"]
    ]
      .map(([value, type]) => `${encodeBs58(value)}${type}`)
      .join("&&")
  })
}
