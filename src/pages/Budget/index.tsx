import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import InputMask from 'react-input-mask';
import moment from 'moment';
import { BiMailSend } from 'react-icons/bi';

import { LoadingSpinner } from '../../components/Spinner';

import { api } from '../../services/api';
import styles from './styles.module.css';

const Budget = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [tipoEvento, setTipoEvento] = useState('');

  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data: any) => {
    const { tipo, name, phone, product, dataEvento, local, cerimonial, obs } =
      data;

    setIsLoading(true);

    const result = {
      name: `${name} - Terrá`,
      phone,
      product_id: product,
      dataEvento: moment(dataEvento, 'YYYY-MM-DD'),
      local,
      indication: cerimonial,
      status: 'Aberto',
      company_id: 1,
      observations: obs,
    };

    // await api.post('agreements', result);

    setIsLoading(false);

    navigate('/success-mail');
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className={styles.content}>
      <header>
        <h3>Orçamento</h3>
      </header>
      <form action="">
        <div className={styles.field}>
          <label htmlFor="evento">Evento</label>
          <select
            {...register('evento', { required: true })}
            onChange={e => setTipoEvento(e.target.value as any)}
          >
            <option value="">Selecione</option>
            <option value="Aniversário">Aniversário</option>
            <option value="Bodas">Bodas</option>
            <option value="Casamento">Casamento</option>
            <option value="Confraternização">Confraternização</option>
            <option value="Congresso">Congresso</option>
            <option value="Corporativo">Corporativo</option>
            <option value="Debutante">Debutante</option>
            <option value="Diversos">Diversos</option>
            <option value="Formatura">Formatura</option>
          </select>
          {errors.tipoEvento && <span>Tipo de evento obrigaório</span>}

          <div>
            <label htmlFor="name">Nome completo</label>
            <input id="name" {...register('name', { required: true })} />
            {errors.name && <span>Nome obrigatório</span>}
          </div>
        </div>
      </form>
    </div>
  );
};

export default Budget;
