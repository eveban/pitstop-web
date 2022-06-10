import React from 'react';

import './style.css';

import sendMail from '../../assets/sendMail.png';

const SuccessEmail: React.FC = () => {
  return (
    <div className="success">
      <img src={sendMail} alt="E-mail enviando com sucesso" />
      <h1>E-mail enviado com sucesso!</h1>
      <h4>Verifique sua caixa de entrada ou spam</h4>
    </div>
  );
};

export default SuccessEmail;
