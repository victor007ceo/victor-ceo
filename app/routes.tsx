import React from "react";
import { createBrowserRouter, Navigate } from "react-router";
import { Layout } from "./Layout";
import { PreRelease } from "./pages/PreRelease";
import { TheExhibition } from "./pages/TheExhibition";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Layout,
    children: [
      {
        index: true,
        Component: TheExhibition,
      },
      {
        path: "exclusive-access",
        Component: PreRelease,
      },
      {
        path: "pre-release",
        element: <Navigate to="/exclusive-access" replace />,
      },
      {
        path: "exhibition",
        element: <Navigate to="/" replace />,
      },
      {
        path: "*",
        element: <Navigate to="/" replace />,
      },
    ],
  },
]);
