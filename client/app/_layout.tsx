import { Redirect, SplashScreen, Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import{GestureHandlerRootView} from 'react-native-gesture-handler'


SplashScreen.preventAutoHideAsync();
function AuthGuard(){
  const { isSigneedIn } = {isSigneedIn: false}
  if(isSigneedIn){
    return<Redirect href="/(auth)"/>
  }
  else if (isSigneedIn){
    return<Redirect href="/(tabs)"/>
  }
}
export default function RootLayout() {
  return <GestureHandlerRootView style={{flex:1}}>
    <AuthGuard/>
  <Stack screenOptions={{headerShown:false}}>
   <Stack.Screen name="(auth)"/> 
   <Stack.Screen name="(tabs)"/> 
   <Stack.Screen name="chat/[id]" options={{animation:"slide_from_right"}}/> 
    </Stack>
    <StatusBar style = "dark"/>
  </GestureHandlerRootView>

}
