import React, {useState, useEffect} from 'react';
import { View, TouchableOpacity, Linking ,Text , Image, StyleSheet, SafeAreaView } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { RectButton } from 'react-native-gesture-handler';
import { Feather as Icon } from '@expo/vector-icons';
import { FontAwesome as Icon2 } from '@expo/vector-icons';
import * as MailComposer from 'expo-mail-composer';
import Constants from 'expo-constants';
import api from '../../services/api';

interface Params{
  point_id: number;
}

interface Data{
  point:{
    image: string,
    image_url: string,
    name: string,
    email: string,
    whatsapp: string,
    city: string,
    uf: string
  },
  items:{
    title:string
  }[]
}

const Details = () =>{
  //Navegação
  const navivation = useNavigation();
  const route = useRoute();
  const routeParams = route.params as Params;
  function handleNavigateBack(){
      navivation.goBack();
  }
  //Estado
  const [data, setData] = useState<Data>({} as Data);
  //Chamada a API
  useEffect(() => {
    api.get(`points/${routeParams.point_id}`)
    .then(response =>{
      setData(response.data);
    });
  },[]);

  //funcao para envio de email
  function handleComposeMail(){
    MailComposer.composeAsync({
      subject: 'Interesse na Coleta de Resíduos',
      recipients: [data.point.email],

    });
  }
  //Funcao que envia whatsapp
  function handleSendWhatsapp(){
    Linking.openURL(`whatsapp://send?phone=${data.point.whatsapp}&text=Enviado pelo app Ecoleta`);
  }

  //Verifica se o ponto exista, caso não exista retorna null
  if(!data.point){
    return null;
  }

  return(
    <SafeAreaView style={{flex: 1}}>
      <View style={styles.container}>
        <TouchableOpacity onPress={handleNavigateBack}>
          <Icon name='arrow-left' size={20} color="#34cb79"></Icon>
        </TouchableOpacity>
        <Image style={styles.pointImage} source={{uri: data.point.image_url}}/>
        <Text style={styles.pointName}>{data.point.name}</Text>
        <Text style={styles.pointItems}>
          {data.items.map(item => item.title).join(',')}
        </Text>
        <View style={styles.address}>
          <Text style={styles.addressTitle}>Endereço</Text>
          <Text style={styles.addressContent}>{data.point.city} - {data.point.uf}</Text>
        </View>
      </View>
      <View style={styles.footer}>
        <RectButton style={styles.button} onPress={handleSendWhatsapp}>
          <Icon2 name="whatsapp" size={20} color="#fff"></Icon2>
          <Text style={styles.buttonText}>Whatsapp</Text>
        </RectButton>
        <RectButton style={styles.button} onPress={handleComposeMail}>
          <Icon2 name="envelope-o" size={20} color="#fff"></Icon2>
          <Text style={styles.buttonText}>E-mail</Text>
        </RectButton>
      </View> 
    </SafeAreaView>
          
   );
}

const styles = StyleSheet.create({
    container: {
      flex: 1,
      padding: 32,
      paddingTop: 20 + Constants.statusBarHeight,
    },
  
    pointImage: {
      width: '100%',
      height: 120,
      resizeMode: 'cover',
      borderRadius: 10,
      marginTop: 32,
    },
  
    pointName: {
      color: '#322153',
      fontSize: 28,
      fontFamily: 'Ubuntu_700Bold',
      marginTop: 24,
    },
  
    pointItems: {
      fontFamily: 'Roboto_400Regular',
      fontSize: 16,
      lineHeight: 24,
      marginTop: 8,
      color: '#6C6C80'
    },
  
    address: {
      marginTop: 32,
    },
    
    addressTitle: {
      color: '#322153',
      fontFamily: 'Roboto_500Medium',
      fontSize: 16,
    },
  
    addressContent: {
      fontFamily: 'Roboto_400Regular',
      lineHeight: 24,
      marginTop: 8,
      color: '#6C6C80'
    },
  
    footer: {
      borderTopWidth: StyleSheet.hairlineWidth,
      borderColor: '#999',
      paddingVertical: 20,
      paddingHorizontal: 32,
      flexDirection: 'row',
      justifyContent: 'space-between'
    },
    
    button: {
      width: '48%',
      backgroundColor: '#34CB79',
      borderRadius: 10,
      height: 50,
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center'
    },
  
    buttonText: {
      marginLeft: 8,
      color: '#FFF',
      fontSize: 16,
      fontFamily: 'Roboto_500Medium',
    },
  });

export default Details;