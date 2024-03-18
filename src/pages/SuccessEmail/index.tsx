import React from 'react';

import './style.css';

import sendMail from '../../assets/sendMail.png';

const SuccessEmail: React.FC = () => {
  return (
    <div className="success">
      <img src={sendMail} alt="E-mail enviando com sucesso" />
      <h1>Contrato preenchido com sucesso!</h1>
      <h4>Logo enviaremos um e-mail para a assinatura do mesmo.</h4>
    </div>
  );
};

export default SuccessEmail;
