import React, { useEffect, useState, ChangeEvent, FormEvent } from  'react';
import { Link, useHistory } from 'react-router-dom';
import { Map, TileLayer, Marker, } from 'react-leaflet';
import { LeafletMouseEvent } from 'leaflet';
import axios from 'axios';
import { FiArrowLeft } from 'react-icons/fi';
import api from '../../services/api';
import './styles.css';
import logo from '../../assets/logo.svg';

interface Item{
    id: number,
    name: string,
    image_url: string
};

interface ibgeUfResponse{
    sigla: string
}

interface ibgeCityResponse{
    nome: string
}

const CreatePoint = () => {

    const [formData, setFormData] = useState({name:'',email: '', whatsapp:''});
    const [items, setItems] = useState<Item[]>([]);
    const [selectedItems, setSelectedItems] = useState<number[]>([]);
    const [ufs, setufs] = useState<string[]>([]);
    const [selectedUf, setSelectedUfs] = useState('0');
    const [cities, setCities] = useState<string[]>([]);
    const [selectedCity, setSelectedCity] = useState('0');
    const [selectedPosition,setSelectedPosition] = useState<[number,number]>([0,0]);
    const [initialPosition,setInitialPosition] = useState<[number,number]>([0,0]);

    const history = useHistory();

    useEffect(() => {//Obtem a posição inicial do mapa
        navigator.geolocation.getCurrentPosition(position => {
            const {latitude, longitude} = position.coords;
            setInitialPosition([latitude,longitude]);
        });
    },[]);

    useEffect(() => {//Busca os items na api do backend
        api.get('items').then(response => {
           setItems(response.data);
        });
    },[]);

    useEffect(() =>{//Busca os estados na api do ibge
        axios.get<ibgeUfResponse[]>("https://servicodados.ibge.gov.br/api/v1/localidades/estados?orderBy=nome")
        .then(response => {
            const ufInitials = response.data.map(uf => uf.sigla);
            setufs(ufInitials);
        });
    },[]);

    useEffect(() =>{//Busca a cidade de acordo com o estado selecionado na api do ibge
        if(selectedUf === '0'){
            return;
        }

        axios.get<ibgeCityResponse[]>("https://servicodados.ibge.gov.br/api/v1/localidades/estados/"+ selectedUf +"/municipios")
        .then(response => {
            const citynames = response.data.map(city => city.nome);
            setCities(citynames);
        });
    },[selectedUf]);


    function handleSelectUF(event: ChangeEvent<HTMLSelectElement>){//Muda o estado quando o estado é selecionado pelo usuário
       const uf = event.target.value;
       setSelectedUfs(uf);
    };

    function handleSelectCity(event: ChangeEvent<HTMLSelectElement>){//Muda a estado quando a cidade é seleciona pelo usuário
        const city = event.target.value;
        setSelectedCity(city);
    };

    function handleMapClick(event: LeafletMouseEvent){//Obtem uma posição no mapa de acordo com o click do usuário
        setSelectedPosition([event.latlng.lat,event.latlng.lng]);
    }

    function handleInputChange(event: ChangeEvent<HTMLInputElement>){//Armazena no estado os valores dos inputs
        const { name, value} = event.target;
        setFormData({...formData, [name]:value})
    }

    function handleSelectItem(id: number){//Alimenta o estado com os itens que o usuário clicou
        const alreadySelected = selectedItems.findIndex(item => item === id);
        if(alreadySelected >= 0){
            const filteredItems = selectedItems.filter(item => item !== id);
            setSelectedItems(filteredItems);
        }
        else{
            setSelectedItems([...selectedItems, id]);
        }
    }

    async function handleSubmit(event: FormEvent){//Submit do formulário
        event.preventDefault();
        const {name, email, whatsapp} = formData;
        const uf = selectedUf;
        const city = selectedCity;
        const [latitude, longitude] = selectedPosition;
        const items = selectedItems;
        const data ={
            name,
            email,
            whatsapp,
            latitude,
            longitude,
            city,
            uf,
            items
        };
        await api.post('points',data);
        alert('Ponto de Coleta Criado!');
        history.push('/');
    }

    return(
        <div id="page-create-point">
            <header>
                <img src={logo} alt="EColeta"/>
                <Link to="/">
                    <FiArrowLeft></FiArrowLeft>
                    Voltar Para Home
                </Link>
            </header>
            <form onSubmit={handleSubmit}>
                <h1>Cadastro do<br/> ponto de coleta</h1>
                <fieldset>
                    <legend>
                        <h2>Dados</h2>
                    </legend>
                    <div className="field">
                        <label htmlFor="name">Nome da Entidade</label>
                        <input type="text"
                            name="name"
                            id="name"
                            onChange={handleInputChange}
                        />
                    </div>
                    <div className="field-group">
                        <div className="field">
                            <label htmlFor="email">E-mail</label>
                            <input type="email"
                                name="email"
                                id="email"
                                onChange={handleInputChange}
                            />
                        </div>
                        <div className="field">
                            <label htmlFor="whatsapp">Whatsapp</label>
                            <input type="text"
                                name="whatsapp"
                                id="whatsapp"
                                onChange={handleInputChange}
                            />
                        </div>
                    </div>
                </fieldset>
                <fieldset>
                    <legend>
                        <h2>Endereço</h2>
                        <span>Selecione um endereço no mapa</span>
                    </legend>
                    <Map center={initialPosition} zoom={14} onClick={handleMapClick}>
                        <TileLayer
                            attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                        <Marker position={selectedPosition}></Marker>
                    </Map>
                    <div className="field-group">
                        <div className="field">
                            <label htmlFor="uf">Estado (UF)</label>
                            <select name="uf" id="uf" onChange={handleSelectUF} value={selectedUf}>
                                <option value="0">Selecione Uma UF</option>
                                {ufs.map(uf => (
                                    <option key={uf} value={uf}>{uf}</option>
                                ))}
                            </select>
                        </div>
                        <div className="field">
                            <label htmlFor="city">Cidade</label>
                            <select name="city" id="city" onChange={handleSelectCity} value={selectedCity}>
                                <option value="0">Selecione Uma Cidade</option>
                                {cities.map(city => (
                                    <option key={city} value={city}>{city}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </fieldset>
                <fieldset>
                    <legend>
                        <h2>Itens de Coleta</h2>
                        <span>Selecione um ou mais itens abaixo</span>
                    </legend>
                    <ul className="items-grid">
                        {items.map(item => (
                            <li 
                            key={item.id} 
                            onClick={() => handleSelectItem(item.id)}
                            className={selectedItems.includes(item.id) ? 'selected':''}
                            >
                                <img src={item.image_url} alt={item.name}/>
                                <span>{item.name}</span>
                            </li>
                        ))}
                    </ul>
                </fieldset>
                <button type="submit">Cadastrar Ponto de Coleta</button>
            </form>
        </div>
    );
};

export default CreatePoint;