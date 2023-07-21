/**
 * format 路由表
 */
import { RouteObject } from "react-router-dom";
import React from "react";
import Home from "../pages/Home";
import AcquireNft from "../pages/AcquireNft";
import CreatePoll from "../pages/CreatePoll";
import Vote from "../pages/Vote";
import VotingResults from "../pages/VotingResults";
import DaoMintNft from "../pages/DaoMintNft";
const routes: RouteObject[] = [
  {
    path: "/",
    element: <Home />,
  },
  {
    path: "/acquireNft",
    element: <AcquireNft />,
  },
  {
    path: "/createPoll",
    element: <CreatePoll />,
  },
  {
    path: "/vote/:id",
    element: <Vote />,
  },
  {
    path: "/votingResults/:id",
    element: <VotingResults />,
  },
  {
    path: "/daoMintNft",
    element: <DaoMintNft />,
  },
  {
    path: "*",
    element: <Home />,
  },
]

export default routes
