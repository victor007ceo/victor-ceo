import React from "react";
import { createBrowserRouter, Navigate } from "react-router";
import { Layout } from "./Layout";
import { Home } from "./pages/Home";
import { PreRelease } from "./pages/PreRelease";
import { TheExhibition } from "./pages/TheExhibition";
import { Radar } from "./pages/Radar";
import { Watchlist } from "./pages/Watchlist";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Layout,
    children: [
      {
        index: true,
        Component: Home,
      },
      {
        path: "pre-release",
        Component: PreRelease,
      },
      {
        path: "exhibition",
        Component: TheExhibition,
      },
      {
        path: "radar",
        Component: Radar,
      },
      {
        path: "watchlist",
        Component: Watchlist,
      },
      {
        path: "execution",
        element: <Navigate to="/watchlist" replace />,
      },
      {
        path: "*",
        element: <Navigate to="/" replace />,
      },
    ],
  },
]);