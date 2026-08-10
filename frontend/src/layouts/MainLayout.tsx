import { Outlet } from "react-router-dom";

import Header from "../components/common/Header";
import Sidebar from "../components/common/Sidebar";

function MainLayout() {
    return (
        <div className="app-layout">
            <Sidebar />

            <div className="app-content-area">
                <Header />

                <main className="main-content">
                    <div className="page-shell">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
}

export default MainLayout;