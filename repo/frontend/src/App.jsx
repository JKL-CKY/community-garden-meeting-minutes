import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';

function App() {
  return (
    <div className="app-layout">
      <header>
        <div className="header-content">
          <div className="logo">
            <span>🌱</span>
            <span>绿手指会议纪要</span>
          </div>
          <nav>
            <NavLink to="/" end>
              花园概览
            </NavLink>
            <NavLink to="/meetings">
              会议管理
            </NavLink>
          </nav>
        </div>
      </header>
      <main>
        <Outlet />
      </main>
    </div>
  );
}

export default App;
