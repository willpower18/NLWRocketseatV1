import React, {useState, useEffect } from 'react';
import { Feather as Icon } from '@expo/vector-icons';
import { View, ImageBackground, Picker ,Text , Image, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { RectButton } from 'react-native-gesture-handler';
import axios from 'axios';

interface ibgeUfResponse{
  sigla: string
}

interface ibgeCityResponse{
  nome: string
}

const Home = () =>{
    //Navegação
    const navivation = useNavigation();

    function handleNavigateToPoints(){
        navivation.navigate('Points',{city: selectedCity, uf: selectedUf});
    }
    //Estado da Aplicação
    const [ufs, setufs] = useState<string[]>([]);
    const [selectedUf, setSelectedUfs] = useState('0');
    const [cities, setCities] = useState<string[]>([]);
    const [selectedCity, setSelectedCity] = useState('0');

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

    return(
        <ImageBackground 
        style={styles.container} 
        source={require('../../assets/home-background.png')}
        imageStyle={{ width: 274, height: 368 }}
        >
            <View style={styles.main}>
                <Image source={require('../../assets/logo.png')}/>
                <Text style={styles.title}>Seu marketplace de coleta de resíduos</Text>
                <Text style={styles.description}>Ajudamos pessoas a encontrarem pontos de coleta de forma eficiente.</Text>
            </View>
            <View style={styles.footer}>
                <Picker style={{marginBottom:5}} selectedValue={selectedUf} onValueChange={(itemValue, itemIndex) => setSelectedUfs(itemValue)}>
                  <Picker.Item label="Selecione um Estado" value="0"></Picker.Item>
                  {ufs.map(uf => (
                    <Picker.Item key={uf} label={uf} value={uf}></Picker.Item>
                  ))}
                </Picker>
                <Picker style={{marginBottom:5}} selectedValue={selectedCity}  onValueChange={(itemValue, itemIndex) => setSelectedCity(itemValue)}>
                  <Picker.Item label="Selecione uma Cidade" value="0"></Picker.Item>
                  {cities.map(city => (
                    <Picker.Item key={city} label={city} value={city}></Picker.Item>
                  ))}
                </Picker>
                <RectButton style={styles.button} onPress={handleNavigateToPoints}>
                    <View style={styles.buttonIcon}><Icon name='arrow-right' color="#fff" size={24}></Icon></View>
                    <Text style={styles.buttonText}>Entrar</Text>
                </RectButton>
            </View>
        </ImageBackground>
    );
}

const styles = StyleSheet.create({
    container: {
      flex: 1,
      padding: 32,
    },
  
    main: {
      flex: 1,
      justifyContent: 'center',
    },
  
    title: {
      color: '#322153',
      fontSize: 32,
      fontFamily: 'Ubuntu_700Bold',
      maxWidth: 260,
      marginTop: 64,
    },
  
    description: {
      color: '#6C6C80',
      fontSize: 16,
      marginTop: 16,
      fontFamily: 'Roboto_400Regular',
      maxWidth: 260,
      lineHeight: 24,
    },
  
    footer: {},
  
    select: {},
  
    input: {
      height: 60,
      backgroundColor: '#FFF',
      borderRadius: 10,
      marginBottom: 8,
      paddingHorizontal: 24,
      fontSize: 16,
    },
  
    button: {
      backgroundColor: '#34CB79',
      height: 60,
      flexDirection: 'row',
      borderRadius: 10,
      overflow: 'hidden',
      alignItems: 'center',
      marginTop: 8,
    },
  
    buttonIcon: {
      height: 60,
      width: 60,
      backgroundColor: 'rgba(0, 0, 0, 0.1)',
      justifyContent: 'center',
      alignItems: 'center'
    },
  
    buttonText: {
      flex: 1,
      justifyContent: 'center',
      textAlign: 'center',
      color: '#FFF',
      fontFamily: 'Roboto_500Medium',
      fontSize: 16,
    }
  });

export default Home;