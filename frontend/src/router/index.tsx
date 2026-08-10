import { createBrowserRouter } from "react-router-dom";

import MainLayout from "../layouts/MainLayout";
import BookmarkPage from "../pages/BookmarkPage";
import HomePage from "../pages/HomePage";
import NotFoundPage from "../pages/NotFoundPage";
import PolicyPage from "../pages/PolicyPage";
import RecommendPage from "../pages/RecommendPage";
import PolicyDetailPage from "../pages/PolicyDetailPage";

const router = createBrowserRouter([
  {
    element: <MainLayout />,
    children: [
      {
        path: "/",
        element: <HomePage />,
      },
      {
        path: "/policy",
        element: <PolicyPage />,
      },
      {
        path: "/recommend",
        element: <RecommendPage />,
      },
      {
        path: "/bookmark",
        element: <BookmarkPage />,
      },
    ],
  },
  {
    path: "*",
    element: <NotFoundPage />,
  },
  {
    path:"/policy/:id",
    element:<PolicyDetailPage />
  }
]);

export default router;
