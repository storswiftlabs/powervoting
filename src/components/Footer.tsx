/** @format */
import { Typography } from 'antd';
import * as React from "react";
import { useNavigate } from "react-router-dom";

const { Paragraph } = Typography;

const Footer = () => {
  const navigate = useNavigate()

  return (
    <footer className='flex h-[160px]  px-8 items-center justify-between bg-[#273141]'>
      <div className='flex items-center'>
        <img src="/images/logo1.png" alt="" className='w-[100px] mr-8' />
        <div style={{
          fontSize: "1.1rem",
          fontWeight: "bold",
          color: "#7F8FA3",
          maxWidth: "32rem",
        }}> An infrasturcture for DAO governace.
        </div>
      </div>
      <div className='flex flex-col items-center'>
        <div>
          <h4 className='text-xl text-[#7F8FA3] hover:opacity-80 mb-[12px]'>Contact Us</h4>
          <div className='flex justify-around'>
            {/*<div className='mr-3'><a href="https://twitter.com/SwiftNFTMarket" target='blank' ><img className='h-[24px]' src="/images/twitter.svg" alt="" /></a></div>*/}
            <div className='mr-3'><a href="https://github.com/black-domain/power-voting" target='blank' ><img className='h-[24px]'  src="/images/github.svg" alt="" /></a></div>
            <div className='mr-3'><a href="https://discord.gg/Bu5Jf66E" target='blank'><img className='h-[24px]' src="/images/discord.svg" alt="" /></a></div>
            <div className='mr-3'>
              <a href="mailto:data@swiftnftmarket.io" target='blank' >
                <img className='h-[24px]' src="/images/protocol.png" alt="" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )

};
export default Footer;
