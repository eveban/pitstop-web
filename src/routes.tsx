import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import Home from './pages/Agreement';

const Router: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/contrato" element={<Home />} />
      </Routes>
    </BrowserRouter>
  );
};

export default Router;
