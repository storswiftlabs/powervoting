import React, { useState, useEffect } from "react";
import { Menu, Transition } from '@headlessui/react';
import EllipsisMiddle from "./EllipsisMiddle";
// @ts-ignore
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { connectWalletPlugin, delectAccount, walletAccount, walletConnected } from "../hooks/aleo"
import { useStore } from "../lib/context"


export const ConnectWeb3Button = (props: any) => {
  const [state, dispatch] = useStore();
  const [address, setAddress] = useState("");

  useEffect(() => {
    window.addEventListener("load", () => {
      connectWallet();
    });
    return () => {
      window.removeEventListener("load", () => {
        connectWallet();
      })
    }
  }, []);

  useEffect(() => {
    if (state) {
      setAddress(state.currentAddress);
    }
  }, [state]);

  async function connectWallet() {
    // 是否链接过钱包
    let isConnect = await walletConnected();
    dispatch({ type: "walletConnected", value: isConnect });
    if (isConnect) {
      setAddressData();
      return;
    }
  }

  function disConnect() {
    dispatch({type: "walletConnected", value: false})
  }

  async function setAddressData() {
    let account = await walletAccount();
    console.log(account);
    if (account && account.address) {
      dispatch({ type: "currentAddress", value: account.address });
    }
  }

  const pullUpPlugin = async () => {
    // @ts-ignore
    if (!window.wallet) {
      // 清空localStorage
      await delectAccount();
      // @ts-ignore
      message.error("info", "Please Install Soter | Aleo Wallet Plugin");
      return;
    }
    // 是否链接过钱包
    let isConnect = await walletConnected();
    dispatch({ type: "walletConnected", value: isConnect });
    if (isConnect) {
      setAddressData();
      return;
    }
    // 链接钱包
    const account = await connectWalletPlugin();
    if (account) {
      dispatch({ type: "walletConnected", value: true });
      setAddressData();
    } else {
      dispatch({ type: "currentAddress", value: "" });
    }
  };

  return (
    <div>
      {address ? (
        <Menu>
          <Menu.Button>
              <div className='bg-sky-500 hover:bg-sky-700 text-white py-2 px-4 rounded-xl'>
                {EllipsisMiddle({ suffixCount: 4, children: address })}
              </div>
          </Menu.Button>
          <Transition
            enter='transition ease-out duration-100'
            enterFrom='transform opacity-0 scale-95'
            enterTo='transform opacity-100 scale-100 relative z-10'
            leave='transition ease-in duration-75'
            leaveFrom='transform opacity-100 scale-100'
            leaveTo='transform opacity-0 scale-95'
          >
            <Menu.Items className='absolute right-0 mt-2 w-56 origin-top-right divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none'>
              <div className='px-1 py-1 '>
                <CopyToClipboard
                  text={address}
                  onCopy={() => {
                    console.log('X')
                  }}
                >
                  <Menu.Item>
                    {({ active }) => (
                      <button
                        className={`${
                          active
                            ? 'bg-sky-500 text-[#fff]'
                            : 'text-gray-900'
                        } group flex w-full items-center rounded py-4 px-8 text-xl`}
                      >
                        Copy Address
                      </button>
                    )}
                  </Menu.Item>
                </CopyToClipboard>

                <Menu.Item
                  // @ts-ignore
                  onClick={disConnect}
                >
                  {({ active }) => (
                    <button
                      className={`${
                        active ? 'bg-sky-500 text-[#fff]' : 'text-gray-900'
                      } group flex w-full items-center rounded py-4 px-8 text-xl`}
                    >
                      Disconnect
                    </button>
                  )}
                </Menu.Item>
              </div>
            </Menu.Items>
          </Transition>
        </Menu>
      ) : (
        <button
          className='bg-sky-500 hover:bg-sky-700 text-white py-2 px-4 rounded-xl'
          onClick={pullUpPlugin}
        >
          Connect Wallet
        </button>
      )}
    </div>
  )
}
