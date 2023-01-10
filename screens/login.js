import * as React from 'react';
import { Text, View, StyleSheet, TouchableOpacity,FlatList,TextInput,ImageBackground,Image } from 'react-native';
import {ListItem,Icon} from 'react-native-elements'
import { KeyboardAvoidingView } from 'react-native-web';
import db from '../config'
import firebase from 'firebase'
const bgImage = require('../assets/background2.png');
const appIcon = require('../assets/appIcon.png');
const appName = require('../assets/appName.png');


export default class LoginScreen extends React.Component{
constructor(props){
    super(props)
    this.state={
        email:'',
        password:''
    }
}
handleLogin=(email,password)=>{
    firebase
    .auth()
    .signInWithEmailAndPassword(email,password)
    .then(()=>{this.props.navigation.navigate('BottomTab')})
    .catch((error)=>{alert(error.message)})
}
render(){
    const {email,password}= this.state
return(
   <KeyboardAvoidingView behavior='padding' style={styles.container}>
    <ImageBackground source={bgImage} style={styles.bgImage}>
    <View style={styles.upperContainer}>
    <Image source={appIcon} style={styles.appIcon} />
    <Image source={appName} style={styles.appName} />
    </View>

    <View style={styles.lowerContainer}>
        <TextInput
        style={styles.textInput}
        placeholderTextColor={'white'}
        placeholder={'Enter Email'}
        onChangeText={(text)=>{this.setState({email:text})}}
        autoFocus
        />
        <TextInput
        style={[styles.textInput,{marginTop:20}]}
        placeholderTextColor={'white'}
        placeholder={'Enter Password'}
        onChangeText={(text)=>{this.setState({password:text})}}
        secureTextEntry
        />
        <TouchableOpacity 
        onPress={()=>{this.handleLogin(email,password)}} 
        style={[styles.button,{marginTop:30}]}>
        <Text style={styles.buttonText}>
        Login
        </Text>
        </TouchableOpacity>

    </View>
    </ImageBackground>
   </KeyboardAvoidingView>
)
}
}

const styles=StyleSheet.create({
    upperContainer:{
        flex:0.5,
        justifyContent:'center',
        alignItems:'center'
    },
    lowerContainer:{
        flex:0.3,
        alignItems:'center'
    },
    button:{
        width:'45%',
        height:60,
        justifyContent:'center',
        alignItems:'center',
        borderRadius:20,
        backgroundColor:'#F48D20'
    },
    buttonText:{
        fontSize:25,
        color:'white',
        fontFamily:'Rajdhani_600SemiBold'
    },
    bgImage:{
        flex:1,
        resizeMode:'cover',
        justifyContent:'center'
    },
    appIcon:{
        width:280,
        height:280,
        resizeMode:'contain'
    },
    appName:{
        width:130,
        height:130,
        resizeMode:'contain'
    },
    container:{
       flex:1,
       backgroundColor:'white' 
    },
    textInput:{
        width:'80%',
        height:60,
        borderColor:'white',
        borderWidth:4,
        borderRadius:10,
        fontSize:20,
        color:'white',
        fontFamily:'Rajdhani_600SemiBold',
        backgroundColor:'#00AEA9',
        padding:10
    }

})