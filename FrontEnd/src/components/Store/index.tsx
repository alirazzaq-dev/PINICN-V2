import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { BigNumber } from 'ethers'

interface MasterContracts {
  lockerFactory: string,
  lockerFactoryMethods: any
}

interface NetworkDetail {
  id: number,
  chain: string
}

interface UserInfo {
  userAddress: string,
}

export interface LockTokenInputInfo {
    loading: boolean | null;
    address: string | null;
    methods: any;
    name: string | null;
    symbol: string | null;
    decimal: Number | null;
    totalSupply: Number | null;
    youhold: Number | null;
    allowance: Number | null;
}

export interface LockerInfo {
  id: number;
  type: number
  lockTime: number
  lockerAddress: string
  numOfTokens: number
  owner: string,
  status: number,
  tokenAddress: string,
  unlockTime: number
}

export interface LockersData {
  lockersCount: number | null
  lockers: LockerInfo[] | null
}

export interface DataType {
  networkDetail: NetworkDetail,
  userInfo: UserInfo,
  loading: boolean,
  transectionProgress: boolean,
  masterContracts: MasterContracts,
  lockTokenInfo: LockTokenInputInfo,
  lockersData : LockersData  
}

const defaultLockTokenInfo = {
    loading: null,
    address: null,
    methods: null,
    name: null,
    symbol: null,
    decimal: null,
    totalSupply: null,
    youhold: null,
    allowance: null
}

const initialState: DataType = {
  networkDetail: {
    id: 0,
    chain: "",
  },
  userInfo: {
    userAddress: "",
  },
  loading: false,
  transectionProgress: false,
  masterContracts: {
    lockerFactory: "0xfcA0CcEDAaC3850Be9b03E5833e015A90fffb6aa",
    lockerFactoryMethods: null
  },
  lockTokenInfo: defaultLockTokenInfo,
  lockersData : {
    lockersCount: null,
    lockers: null,

  }
}

const dataSlice = createSlice({
  name: "Lottery",
  initialState,
  reducers: {
    clearState(state) {
      return initialState;
    },

    setActiveUserInfo(state, { payload }: PayloadAction<{ address: string, balance: number, erc20Symbol: string }>) {
      state.userInfo.userAddress = payload.address;
    },
    setActiveUser(state, { payload }: PayloadAction<string>) {
      state.userInfo.userAddress = payload;
    },
    setNetworkDetails(state, { payload }: PayloadAction<NetworkDetail>) {
      state.networkDetail.id = payload.id;
      state.networkDetail.chain = payload.chain;
    },
    setLoading(state, { payload }: PayloadAction<boolean>) {
      state.loading = payload
    },
    setLockerMasterMethods(state, {payload}: PayloadAction<any>){
      state.masterContracts.lockerFactoryMethods = payload
    },
    setTransactionProgress(state, { payload }: PayloadAction<boolean>) {
      state.transectionProgress = payload
    },
    setLockTokenInfo(state, { payload }: PayloadAction<LockTokenInputInfo | null> ) {
      if (payload === null) {
        state.lockTokenInfo = defaultLockTokenInfo;
      }
      else {
        state.lockTokenInfo = payload;

      }
    },
    setLockTokenLoading(state, { payload }: PayloadAction<boolean>) {
      state.lockTokenInfo.loading = payload;
    },
    addLockerData(state, { payload }: PayloadAction<{count: number, lockers: LockerInfo[]}>) {
      state.lockersData.lockersCount = payload.count;
      state.lockersData.lockers = payload.lockers;
    },










  }


});




// Extract the action creators object and the reducer
const { actions, reducer } = dataSlice
// Extract and export each action creator by name
export const { addLockerData, setLockerMasterMethods, setLockTokenLoading, setLockTokenInfo, setActiveUser, setNetworkDetails } = actions
// Export the reducer, either as a default or named export
export default reducer
