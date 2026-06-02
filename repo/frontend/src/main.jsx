import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import App from './App.jsx';
import GardenView from './pages/GardenView.jsx';
import MeetingsView from './pages/MeetingsView.jsx';
import MeetingDetail from './pages/MeetingDetail.jsx';
import MinutesView from './pages/MinutesView.jsx';
import './styles/global.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />}>
          <Route index element={<GardenView />} />
          <Route path="meetings" element={<MeetingsView />} />
          <Route path="meetings/:id" element={<MeetingDetail />} />
          <Route path="minutes/:id" element={<MinutesView />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
