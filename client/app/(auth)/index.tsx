import { View, Text, KeyboardAvoidingView, Platform } from 'react-native'
import React, { useState } from 'react'
import { useRouter } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { styles } from '@/assets/styles/AuthScreen.styles'
import { ScrollView } from 'react-native-gesture-handler'
import {LinearGradient} from "expo-linear-gradient"
import { Colors } from '@/constants/Colors'
import{SvgXml} from 'react-native-svg'


type Mode = "login" | "register"

export default function AuthScreen() {
    const[mode, setMode]= useState<Mode>("login")
    const[name, setName]= useState("")
    const[handle, setHandle]= useState("")
    const[email, setEmail]= useState("");
    const[password, setPassword]= useState("");
    const[vrificationcode, setVrificationcode]= useState("");
    const[loading, setLoading]= useState(false);
    const[verifying, setVerifying]= useState(false);
    const router = useRouter();


    const svgMarkup =`<svg width="256" height="256" viewBox="0 0 256 256"
     xmlns="http://www.w3.org/2000/svg">

  <!-- Background -->
  <circle
    cx="128"
    cy="128"
    r="112"
    fill="#2563EB"
  />

  <!-- Ribbon K -->
  <path
    d="
      M92 62
      L92 194

      M92 128
      C112 112 128 98 154 72

      M92 128
      C118 142 136 158 162 186
    "
    fill="none"
    stroke="#FFFFFF"
    stroke-width="18"
    stroke-linecap="round"
    stroke-linejoin="round"
  />

  <!-- Spark -->
  <circle
    cx="185"
    cy="72"
    r="4"
    fill="#FFFFFF"
  />

</svg>`
  return (
    <SafeAreaView style={styles.safe}>
        <KeyboardAvoidingView style= {styles.kav} behavior={Platform.OS ==="ios" ? "padding" : undefined}>
            <ScrollView contentContainerStyle = {styles.scroll} 
            keyboardShouldPersistTaps = "handled">

                {/* Logo*/}
                <View style={styles.logoRow}> 
                    <LinearGradient colors = {[Colors.primary,Colors.primaryContainer]}style = {styles.logoBox}>   
                        <SvgXml xml = {svgMarkup} width="50%" height="50%" />

                    </LinearGradient>
                    <Text style= {styles.appName}> KuraKani</Text>   
                       
                    


                </View>


            </ScrollView>
            
            

        </KeyboardAvoidingView>
    </SafeAreaView>
  )
}