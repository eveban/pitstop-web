/* eslint-disable camelcase */
/* eslint-disable no-unsafe-optional-chaining */
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import InputMask from 'react-input-mask';
import axios from 'axios';
import CurrencyInput from 'react-currency-input-field';
import moment from 'moment';

import { LoadScript, StandaloneSearchBox } from '@react-google-maps/api';

import { BiMailSend } from 'react-icons/bi';

import { LoadingSpinner } from '../../components/Spinner';

import validaCPF from '../../utils/validaCPF';
import validaCNPJ from '../../utils/validaCNPJ';

import { api } from '../../services/api';
import './style.css';

interface IEndereco {
  logradouro: string;
  localidade: string;
  bairro: string;
  number: string;
  uf: string;
}

export const Agreement: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);

  const [endereco, setEndereco] = useState<IEndereco>();
  const [tipoProduto, setTipoProduto] = useState('');
  const [tipoPessoa, setTipoPessoa] = useState();
  const [localEvento, setLocalEvento] = useState('');
  const [nameLocal, setNameLocal] = useState('');
  const [descricaoProduto, setDescricaoProduto] = useState('');

  const [searchBoxA, setSearchBoxA] =
    React.useState<google.maps.places.SearchBox>();

  const onLoadA = (ref: google.maps.places.SearchBox) => {
    setSearchBoxA(ref);
  };

  const onPlacesChangedA = () => {
    const places = searchBoxA?.getPlaces();
    const place = places?.[0];
    const { name, formatted_address }: any = place;

    setLocalEvento(formatted_address);
    setNameLocal(name);
  };

  const navigate = useNavigate();

  useEffect(() => {
    switch (tipoProduto) {
      case '1':
        setDescricaoProduto('Totem Fotográfico');
        break;
      case '2':
        setDescricaoProduto('Hashtag Pitstop');
        break;
      case '3':
        setDescricaoProduto('Cabine Fotográfica Tradicional');
        break;
      case '4':
        setDescricaoProduto('Cabine Fotográfica Premium');
        break;
      case '5':
        setDescricaoProduto('Espelho Mágico');
        break;
      case '6':
        setDescricaoProduto('Espelho Meu (Portátil)');
        break;
      case '9':
        setDescricaoProduto('Ring Light');
        break;
      case '10':
        setDescricaoProduto('Cabine Infinity e Ring Light');
        break;
      case '12':
        setDescricaoProduto('Cabine Infinity Led');
        break;
      default:
        setDescricaoProduto('');
    }
  }, [tipoProduto]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const handleGeneratedAgreementSendToEmail = async (
    cpf: string,
    dataEvento: Date,
  ) => {
    const cpfFormatado = cpf.replace(/[^\d]+/g, '');
    await api.get(
      `agreements/generated-agreement?cpf=${cpfFormatado}&dataEvento=${dataEvento}`,
    );
    await api.get(
      `/agreements/send-mail?cpf=${cpfFormatado}&dataEvento=${dataEvento}`,
    );
  };

  const onSubmit = async (data: any) => {
    const {
      name,
      email,
      cpf,
      phone,
      cep,
      number,
      product,
      sizeTemplate,
      valorContrato,
      quantidadeHoras,
      dataEvento,
      initialHour,
      endHour,
      local,
      cerimonial,
      formaPagamento,
      dataEntrada,
      nameTemplate,
      valorEntrada,
      obs,
    } = data;

    const formataCPFCNPJ = await cpf
      .replace('-', '')
      .replace('.', '')
      .replace('.', '')
      .replace('/', '');

    if (formataCPFCNPJ.length === 11) {
      const validacao = validaCPF(formataCPFCNPJ);
      if (!validacao) {
        alert('CPF inválido!');
        return;
      }
    }

    if (formataCPFCNPJ.length > 12) {
      const validacao = validaCNPJ(formataCPFCNPJ);
      if (!validacao) {
        alert('CNPJ inválido!');
        return;
      }
    }

    setIsLoading(true);

    const result = {
      name,
      descricaoProduto,
      email,
      cpf: cpf
        .replace('-', '')
        .replace('.', '')
        .replace('.', '')
        .replace('/', ''),
      phone,
      address: `${endereco?.logradouro}, ${number}, ${endereco?.bairro}, ${endereco?.localidade}/${endereco?.uf}, ${cep}`,
      product_id: product,
      sizeTemplate,
      valorContrato: Number(
        String(valorContrato)
          .replace('R$', '')
          .replace('.', '')
          .replace(',', '.'),
      ),
      quantidadeHoras,
      dataEvento: moment(dataEvento, 'YYYY-MM-DD'),
      local: localEvento || local,
      nameLocal,
      startEventHour: `${dataEvento} ${initialHour}`,
      endEventHour: `${dataEvento} ${endHour}`,
      indication: cerimonial,
      typePayment: formaPagamento,
      dataEntrada: moment(dataEntrada, 'YYYY-MM-DD'),
      valorEntrada: Number(
        String(valorEntrada)
          .replace('R$', '')
          .replace('.', '')
          .replace(',', '.'),
      ),
      status: 'Aberto',
      company_id: 1,
      nameTemplate,
      observations: obs,
    };

    await api.post('agreements', result);

    await api.post('agreements/createGoogleEvent', result, {
      headers: {
        calendarid: 'pitstopcabines@gmail.com',
      },
    });

    await handleGeneratedAgreementSendToEmail(cpf, dataEvento);

    setIsLoading(false);

    navigate('/success-mail');
  };

  const handleSearchcep = async (cep: string) => {
    const formatCep = cep.replace('.', '').replace('-', '').replace('_', '');
    if (formatCep.length === 8) {
      const result = await axios.get(
        `https://viacep.com.br/ws/${formatCep}/json/`,
      );
      if (result.data.erro) {
        window.alert('Endereço não encontrado');
      }
      setEndereco(result.data);
    }
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <>
      <LoadScript
        googleMapsApiKey=""
        libraries={['places']}
        language="pt_BR"
        region="BR"
      />
      <nav id="navigaton">
        <div className="wrapper">
          <a className="logo" href="#home">
            <svg
              width="96"
              height="30"
              viewBox="0 0 96 30"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M7.08 0.999998C9.26667 0.999998 10.9067 1.58667 12 2.76C13.0933 3.93333 13.64 5.65333 13.64 7.92V11.56C13.64 13.8267 13.0933 15.5467 12 16.72C10.9067 17.8933 9.26667 18.48 7.08 18.48H5V29H0.6V0.999998H7.08ZM5 14.48H7.08C7.8 14.48 8.33333 14.28 8.68 13.88C9.05333 13.48 9.24 12.8 9.24 11.84V7.64C9.24 6.68 9.05333 6 8.68 5.6C8.33333 5.2 7.8 5 7.08 5H5V14.48ZM20.2734 0.999998V29H15.8734V0.999998H20.2734ZM35.8106 0.999998V5H31.2106V29H26.8106V5H22.2106V0.999998H35.8106Z"
                fill="#526373"
              />
              <path
                d="M37.1884 7.72C37.1884 5.45333 37.7351 3.72 38.8284 2.52C39.9218 1.29333 41.5351 0.68 43.6684 0.68C45.8018 0.68 47.4151 1.29333 48.5084 2.52C49.6018 3.72 50.1484 5.45333 50.1484 7.72V8.6H45.9884V7.44C45.9884 6.48 45.8018 5.78667 45.4284 5.36C45.0551 4.90667 44.5084 4.68 43.7884 4.68C43.0684 4.68 42.5218 4.90667 42.1484 5.36C41.7751 5.78667 41.5884 6.48 41.5884 7.44C41.5884 8.61333 41.8951 9.64 42.5084 10.52C43.1484 11.4 44.0951 12.4 45.3484 13.52C46.3884 14.48 47.2284 15.3333 47.8684 16.08C48.5084 16.8 49.0551 17.68 49.5084 18.72C49.9618 19.76 50.1884 20.9467 50.1884 22.28C50.1884 24.5467 49.6284 26.2933 48.5084 27.52C47.3884 28.72 45.7618 29.32 43.6284 29.32C41.4951 29.32 39.8684 28.72 38.7484 27.52C37.6284 26.2933 37.0684 24.5467 37.0684 22.28V20.56H41.2284V22.56C41.2284 24.3733 41.9884 25.28 43.5084 25.28C45.0284 25.28 45.7884 24.3733 45.7884 22.56C45.7884 21.3867 45.4684 20.36 44.8284 19.48C44.2151 18.6 43.2818 17.6 42.0284 16.48C40.9884 15.52 40.1484 14.68 39.5084 13.96C38.8684 13.2133 38.3218 12.32 37.8684 11.28C37.4151 10.24 37.1884 9.05333 37.1884 7.72ZM65.0294 0.999998V5H60.4294V29H56.0294V5H51.4294V0.999998H65.0294ZM66.6072 7.72C66.6072 5.48 67.1805 3.74666 68.3272 2.52C69.4739 1.29333 71.1272 0.68 73.2872 0.68C75.4472 0.68 77.1005 1.29333 78.2472 2.52C79.3939 3.74666 79.9672 5.48 79.9672 7.72V22.28C79.9672 24.52 79.3939 26.2533 78.2472 27.48C77.1005 28.7067 75.4472 29.32 73.2872 29.32C71.1272 29.32 69.4739 28.7067 68.3272 27.48C67.1805 26.2533 66.6072 24.52 66.6072 22.28V7.72ZM71.0072 22.56C71.0072 24.4 71.7672 25.32 73.2872 25.32C74.8072 25.32 75.5672 24.4 75.5672 22.56V7.44C75.5672 5.6 74.8072 4.68 73.2872 4.68C71.7672 4.68 71.0072 5.6 71.0072 7.44V22.56ZM89.3066 0.999998C91.4932 0.999998 93.1332 1.58667 94.2266 2.76C95.3199 3.93333 95.8666 5.65333 95.8666 7.92V11.56C95.8666 13.8267 95.3199 15.5467 94.2266 16.72C93.1332 17.8933 91.4932 18.48 89.3066 18.48H87.2266V29H82.8266V0.999998H89.3066ZM87.2266 14.48H89.3066C90.0266 14.48 90.5599 14.28 90.9066 13.88C91.2799 13.48 91.4666 12.8 91.4666 11.84V7.64C91.4666 6.68 91.2799 6 90.9066 5.6C90.5599 5.2 90.0266 5 89.3066 5H87.2266V14.48Z"
                fill="#D91C5C"
              />
            </svg>
          </a>
        </div>
      </nav>
      <section id="home">
        <div className="wrapper">
          <header>
            <h4>Bem-vindo a PITSTOP!</h4>
            <h1>Contrato de prestação de Serviço</h1>
          </header>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="content">
              <p>Preencha seus dados para emissão do contrato</p>

              <div className="field">
                <div>
                  <label htmlFor="tipoPessoa">Tipo cliente</label>
                  <select
                    // {...register('product', { required: true })}
                    onChange={e => setTipoPessoa(e.target.value as any)}
                  >
                    <option value="">Selecione</option>
                    <option value={1}>Pessoa Física</option>
                    <option value={2}>Pessoa Jurídica</option>
                  </select>
                  {/* {errors.product && <span>Produto obrigatório</span>} */}
                </div>
                <div>
                  <label htmlFor="name">Nome completo</label>
                  <input id="name" {...register('name', { required: true })} />
                  {errors.name && <span>Nome obrigatório</span>}
                </div>
                <div>
                  <label htmlFor="cpf">
                    {tipoPessoa === '2' ? 'CNPJ' : 'CPF'}
                  </label>
                  <InputMask
                    type="text"
                    {...register('cpf', { required: true })}
                    name="cpf"
                    mask={
                      tipoPessoa === '2'
                        ? '99.999.999/9999-99'
                        : '999.999.999-99'
                    }
                    id="cpf"
                  />
                  {errors.cpf && (
                    <span>
                      {tipoPessoa === '2'
                        ? 'CNPJ obrigatório'
                        : 'CPF obrigatório'}
                    </span>
                  )}
                </div>
              </div>
              <div className="field">
                <div>
                  <label htmlFor="email">Email</label>
                  <input
                    id="email"
                    type="email"
                    {...register('email', { required: true })}
                  />
                  {errors.email && <span>E-mail obrigatório</span>}
                </div>

                <div>
                  <label htmlFor="whatsapp">
                    Telefone (preferência WhatsApp)
                  </label>
                  <InputMask
                    {...register('phone', { required: true })}
                    type="tel"
                    name="phone"
                    mask="55(99)99999-9999"
                    id="whatsapp"
                  />
                </div>
              </div>
              <div className="field">
                <div>
                  <label htmlFor="cep">CEP</label>
                  <InputMask
                    type="text"
                    mask="99.999-999"
                    id="cep"
                    {...register('cep', { required: true })}
                    onKeyUp={e =>
                      handleSearchcep((e.target as HTMLTextAreaElement).value)
                    }
                  />
                  {errors.cep && <span>CEP obrigatório</span>}
                </div>
                <div>
                  <label htmlFor="address">Rua</label>
                  <input
                    type="text"
                    value={endereco?.logradouro}
                    {...register('address')}
                    name="logradouro"
                  />
                </div>
                <div>
                  <label htmlFor="number">Número</label>
                  <input
                    type="text"
                    {...register('number', { required: true })}
                    name="number"
                  />
                  {errors.number && <span>Número obrigatório</span>}
                </div>
              </div>
              <div className="field">
                <div>
                  <label htmlFor="localidade">Cidade</label>

                  <input
                    value={endereco?.localidade}
                    {...register('localidade')}
                    name="localidade"
                  />
                </div>
                <div>
                  <label htmlFor="bairro">Bairro</label>
                  <input
                    type="text"
                    value={endereco?.bairro}
                    {...register('bairro')}
                    name="bairro"
                    id="bairro"
                  />
                </div>
              </div>
              <div className="field">
                <div>
                  <label htmlFor="Produto">Produto</label>
                  <select
                    {...register('product', { required: true })}
                    onChange={e => setTipoProduto(e.target.value as any)}
                  >
                    <option value="">Selecione o produto</option>
                    <option value={1}>Totem Fotográfico</option>
                    <option value={2}>Hashtag Pitstop</option>
                    <option value={3}>Cabine Fotográfica Tradicional</option>
                    <option value={4}>Cabine Fotográfica Premium</option>
                    <option value={5}>Espelho Mágico</option>
                    <option value={6}>Espelho Meu (Portátil)</option>
                    <option value={9}>Ring Light</option>
                    <option value={10}>Cabine Infinity + Ring Light</option>
                    <option value={12}>Cabine Infinity</option>
                  </select>
                  {errors.product && <span>Produto obrigatório</span>}
                </div>
                <div>
                  <label htmlFor="sizeTemplate">Tipo da moldura</label>
                  <select
                    id="sizeTemplate"
                    {...register('sizeTemplate', { required: true })}
                  >
                    <option value="">Selecione</option>
                    <option value="A definir">A definir</option>
                    <option value="Tradicional (10x15)">
                      Tradicional (10x15)
                    </option>
                    <option value="Tirinhas (5x15)">Tirinhas (5x15)</option>
                    {tipoProduto !== '1' && (
                      <option value="Polaróide (7,5x10)">
                        Polaróide (7,5x10)
                      </option>
                    )}
                    ,
                  </select>
                  {errors.formaPagamento && (
                    <span>Forma de pagamento obrigatória</span>
                  )}
                </div>
                <div>
                  <label htmlFor="valorContrato">Valor contratado</label>
                  <CurrencyInput
                    prefix="R$"
                    decimalSeparator=","
                    decimalScale={2}
                    intlConfig={{ locale: 'pt-BR', currency: 'BRL' }}
                    {...register('valorContrato', { required: true })}
                  />
                  {errors.valorContrato && <span>Valor obrigatório</span>}
                </div>
                <div>
                  <label htmlFor="quantidadeHoras">
                    Quantidade de horas contratada
                  </label>
                  <input
                    type="number"
                    {...register('quantidadeHoras', { required: true })}
                  />
                  {errors.quantidadeHoras && (
                    <span>Quantidade de horas obrigatória</span>
                  )}
                </div>
              </div>

              <div className="field">
                <div>
                  <label htmlFor="valorEntrada">Valor da entrada</label>
                  <CurrencyInput
                    prefix="R$"
                    decimalSeparator=","
                    decimalScale={2}
                    intlConfig={{ locale: 'pt-BR', currency: 'BRL' }}
                    {...register('valorEntrada', { required: true })}
                  />
                  {errors.valorEntrada && (
                    <span>Valor da entrada obrigatória</span>
                  )}
                </div>
                <div>
                  <label htmlFor="formaPagamento">Forma de pagamento</label>
                  <select
                    id="formaPagamento"
                    {...register('formaPagamento', { required: true })}
                  >
                    <option value="">Selecione a forma de pagamento</option>
                    <option value="A prazo">A prazo</option>
                    <option value="A vista">A vista</option>
                  </select>
                  {errors.formaPagamento && (
                    <span>Forma de pagamento obrigatória</span>
                  )}
                </div>
                <div>
                  <label htmlFor="dataEntrada">Data do valor da entrada</label>
                  <input
                    type="date"
                    {...register('dataEntrada', { required: true })}
                  />
                  {errors.dataEntrada && (
                    <span>Data do valor da entrada obrigatória</span>
                  )}
                </div>
              </div>
              <div className="field">
                <div>
                  <label htmlFor="dataEvento">Data do Evento</label>
                  <input
                    type="date"
                    {...register('dataEvento', { required: true })}
                  />
                  {errors.dataEvento && <span>Data do evento obrigatória</span>}
                </div>
                <div>
                  <label htmlFor="initialHour">
                    Horário de inicio do evento
                  </label>
                  <input
                    type="time"
                    {...register('initialHour', { required: true })}
                  />
                  {errors.initialHour && (
                    <span>Hora do início do evento obrigatória</span>
                  )}
                </div>
                <div>
                  <label htmlFor="endHour">Horário de término do evento</label>
                  <input
                    type="time"
                    {...register('endHour', { required: true })}
                  />
                  {errors.endHour && (
                    <span>Horário de término do evento obrigatório</span>
                  )}
                </div>
              </div>
              <div className="field">
                <div>
                  <label htmlFor="nameTemplate">Nome para moldura</label>
                  <input
                    id="nameTemplate"
                    type="text"
                    {...register('nameTemplate', { required: true })}
                  />
                  {errors.local && <span>Nome para moldura</span>}
                </div>
                <div>
                  <label htmlFor="local">
                    Local do evento (endereço ou nome)
                  </label>
                  <StandaloneSearchBox
                    onLoad={onLoadA}
                    onPlacesChanged={onPlacesChangedA}
                  >
                    <input
                      type="text"
                      autoComplete="off"
                      placeholder="Digite o endereço ou nome do local"
                      {...register('local', { required: true })}
                    />
                  </StandaloneSearchBox>
                  {errors.local && <span>Local do evento obrigatório</span>}
                </div>

                <div>
                  <label htmlFor="cerimonial">Cerimonial</label>
                  <input
                    type="text"
                    {...register('cerimonial', { required: true })}
                  />
                  {errors.cerimonial && <span>Cerimonial obrigatório</span>}
                </div>
              </div>
              <div className="field">
                <div>
                  <label htmlFor="obs">Observações</label>
                  <textarea rows={4} id="obs" {...register('obs')} />
                </div>
              </div>
              <button className="button" type="submit">
                <BiMailSend color="#FFF" size={24} />
                Enviar dados
              </button>
            </div>
          </form>
        </div>
      </section>
    </>
  );
};

export default Agreement;
