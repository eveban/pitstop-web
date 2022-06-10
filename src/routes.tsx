import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import Agreement from './pages/Agreement';
import SuccessEmail from './pages/SuccessEmail';
import Home from './App';

const Router: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/contrato" element={<Agreement />} />
        <Route path="/success-mail" element={<SuccessEmail />} />
      </Routes>
    </BrowserRouter>
  );
};

export default Router;
