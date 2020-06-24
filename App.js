import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { OverflowMenuProvider } from 'react-navigation-header-buttons';

import WelcomeScreen from './components/pages/welcome-screen';
import ListsScreen from './components/pages/lists-screen';
import TodosScreen from './components/pages/todos-screen';

const Stack = createStackNavigator();

function App() {
  return (
    <NavigationContainer>
      <OverflowMenuProvider>
        <Stack.Navigator>
          <Stack.Screen options={{headerShown: false}} name="Welcome" component={WelcomeScreen}/>
          <Stack.Screen name="Your Lists" component={ListsScreen}/>
          <Stack.Screen name="Your Todos" component={TodosScreen} options={({ route }) => ({ title : route.params?.headerTitle})}/>
        </Stack.Navigator>
      </OverflowMenuProvider>
    </NavigationContainer>
  )
}

export default App;