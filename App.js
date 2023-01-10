import React from 'react';
import { StyleSheet, Text, View, LogBox } from 'react-native';
import LoginScreen from './screens/login'
import BottomTabNavigator from './components/bottomTabNavigator'

import {Rajdhani_600SemiBold} from '@expo-google-fonts/rajdhani'
import * as Font from 'expo-font'
import {createSwitchNavigator,createAppContainer} from 'react-navigation'

LogBox.ignoreAllLogs()


export default class App extends React.Component {
  constructor(){
    super()
    this.state={
      fontLoaded: false
    }
  }
  async loadFonts(){
    await Font.loadAsync({
      Rajdhani_600SemiBold:Rajdhani_600SemiBold
    })
    this.setState({
      fontLoaded:true
    }
    )
  }
  componentDidMount(){
    this.loadFonts()
  }
  render(){
    const {fontLoaded}=this.state
    if (fontLoaded){
      return <AppContainer/>
    }
    return null;
  }

}
const AppSwitchNavigator= createSwitchNavigator(
  {
    Login: {screen: LoginScreen},
    BottomTab: {screen: BottomTabNavigator}
  },
  {
    initialRouteName: 'Login'
  }
)

const AppContainer= createAppContainer(AppSwitchNavigator)
