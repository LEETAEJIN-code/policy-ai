import { NavLink } from "react-router-dom";


function Sidebar() {
    return (
        <aside className="sidebar">
            <div className="sidebar-logo">
                <div className="sidebar-logo-mark">
                    P
                </div>

                <div>
                    <strong>PolicyAI</strong>
                    <small>지원사업 탐색</small>
                </div>
            </div>

            <nav className="sidebar-menu">
                <NavLink
                    to="/"
                    end
                    className={({ isActive }) =>
                        isActive
                            ? "sidebar-link active"
                            : "sidebar-link"
                    }
                >
                    홈
                </NavLink>

                <NavLink
                    to="/policies"
                    className={({ isActive }) =>
                        isActive
                            ? "sidebar-link active"
                            : "sidebar-link"
                    }
                >
                    정책 조회
                </NavLink>

                <NavLink
                    to="/recommend"
                    className={({ isActive }) =>
                        isActive
                            ? "sidebar-link active"
                            : "sidebar-link"
                    }
                >
                    맞춤 추천
                </NavLink>
                <NavLink
                    to="/recent"
                    className={({ isActive }) =>
                        isActive
                            ? "sidebar-link active"
                            : "sidebar-link"
                    }
                >
                    최근 본 정책
                </NavLink>
                <NavLink
                    to="/bookmarks"
                    className={({ isActive }) =>
                        isActive
                            ? "sidebar-link active"
                            : "sidebar-link"
                    }
                >
                    북마크
                </NavLink>
            </nav>
        </aside>
    );
}


export default Sidebar;