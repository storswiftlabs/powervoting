import React from "react";
import { useRoutes, useLocation, Link } from "react-router-dom";
import routes from "./router";
import { ConnectWeb3Button } from "./components/ConnectWeb3Button";
import Footer from './components/Footer';

import "./common/styles/reset.less";
import "tailwindcss/tailwind.css";
import "./app.less";

const App: React.FC = () => {
  const element = useRoutes(routes);
  const location = useLocation();

  return (
    <div className="layout font-body">
      <header className='h-[96px]  bg-[#273141]'>
        <div className='w-[1000px] h-[96px] mx-auto flex items-center justify-between '>
          <div className='flex items-center'>
            <div className='flex-shrink-0'>
              <Link to='/'>
                <img className="logo" src="/images/logo1.png" alt="" />
              </Link>
            </div>
            <div className='ml-8 flex items-baseline space-x-6'>
              <Link to='/' className={`${location.pathname === '/' ? 'text-white' : 'text-[#7F8FA3]'} text-2xl font-semibold hover:opacity-80`}>
                Power Voting
              </Link>
              <Link to='/acquireNft' className={`${location.pathname === '/acquireNft' ? 'text-white' : 'text-[#7F8FA3]'} text-2xl font-semibold hover:opacity-80`}>
                DAO Governance
              </Link>
            </div>
          </div>
          <ConnectWeb3Button />
        </div>
      </header>
      <div className='content w-[1000px] mx-auto pt-10 pb-10'>
        {element}
      </div>
      <Footer />
    </div>
  )
}

export default App
