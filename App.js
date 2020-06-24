import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { OverflowMenuProvider } from 'react-navigation-header-buttons';

import WelcomeScreen from './components/pages/welcome-screen';
import ListsScreen from './components/pages/lists-screen';
import TodosScreen from './components/pages/todos-screen';
import TodoDetails from './components/pages/todo-details';
import ListDetails from './components/pages/list-details';

const Stack = createStackNavigator();

function App() {
  return (
    <NavigationContainer>
      <OverflowMenuProvider>
        <Stack.Navigator>
          <Stack.Screen options={{headerShown: false}} name="Welcome" component={WelcomeScreen}/>
          <Stack.Screen name="Your Lists" component={ListsScreen}/>
          <Stack.Screen name="Your Todos" component={TodosScreen}/>
          <Stack.Screen name="Task Details" component={TodoDetails}/>
          <Stack.Screen name="List Details" component={ListDetails}/>
        </Stack.Navigator>
      </OverflowMenuProvider>
    </NavigationContainer>
  )
}

export default App;