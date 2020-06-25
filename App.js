import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { OverflowMenuProvider } from 'react-navigation-header-buttons';

import WelcomeScreen from './components/pages/welcome-screen';
import ListsScreen from './components/pages/lists-screen';
import TasksScreen from './components/pages/tasks-screen';
import TaskDetails from './components/pages/task-details';
import ListDetails from './components/pages/list-details';

const Stack = createStackNavigator();

function App() {
  return (
    <NavigationContainer>
      <OverflowMenuProvider>
        <Stack.Navigator>
          <Stack.Screen options={{headerShown: false}} name="Welcome" component={WelcomeScreen}/>
          <Stack.Screen name="Your Lists" component={ListsScreen}/>
          <Stack.Screen name="Your Tasks" component={TasksScreen}/>
          <Stack.Screen name="Task Details" component={TaskDetails}/>
          <Stack.Screen name="List Details" component={ListDetails}/>
        </Stack.Navigator>
      </OverflowMenuProvider>
    </NavigationContainer>
  )
}

export default App;