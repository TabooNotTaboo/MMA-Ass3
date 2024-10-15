import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import AddOrchid from './pages/AddOrchid';
import FavoritesScreen from './pages/FavoritesScreen';
import LoginScreen from './pages/LoginScreen';
import OrchidDetail from './pages/OrchidDetail';
import OrchidList from './pages/OrchidList';

const Stack = createNativeStackNavigator();

const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="OrchidList" component={OrchidList} options={{ title: 'Orchid List' }} />
        <Stack.Screen name="OrchidDetail" component={OrchidDetail} options={{ title: 'Orchid Details' }} />
        <Stack.Screen name="AddOrchid" component={AddOrchid} options={{ title: 'Add New Orchid' }} />
        <Stack.Screen name="Favorites" component={FavoritesScreen} options={{ title: 'Favorite Orchids' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
