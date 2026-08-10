import {
    createBrowserRouter,
} from "react-router-dom";

import MainLayout from "../layouts/MainLayout";

import AdminPage from "../pages/AdminPage";
import BookmarkPage from "../pages/BookmarkPage";
import HomePage from "../pages/HomePage";
import NotFoundPage from "../pages/NotFoundPage";
import PolicyDetailPage from "../pages/PolicyDetailPage";
import PolicyPage from "../pages/PolicyPage";
import RecentPolicyPage from "../pages/RecentPolicyPage";
import RecommendPage from "../pages/RecommendPage";

const router = createBrowserRouter([
    {
        path: "/",
        element: <MainLayout />,
        children: [
            {
                index: true,
                element: <HomePage />,
            },
            {
                path: "policies",
                element: <PolicyPage />,
            },
            {
                path: "policies/:policyId",
                element: <PolicyDetailPage />,
            },
            {
                path: "recommend",
                element: <RecommendPage />,
            },
            {
                path: "recent",
                element: <RecentPolicyPage />,
            },
            {
                path: "bookmarks",
                element: <BookmarkPage />,
            },
            {
                path: "admin",
                element: <AdminPage />,
            },
            {
                path: "*",
                element: <NotFoundPage />,
            },
        ],
    },
]);

export default router;