import React from 'react'
import { View, Text, Button } from 'react-native'

function TodoDetails({navigation, route}) {
    const taskId = route.params?.taskId;
    const taskName = route.params?.taskName;

    return (
        <View>
            <Text>{taskId}</Text>
            <Text>{taskName}</Text>
            <Button title="Go back" onPress={() => navigation.goBack()} />
        </View>
    )
}

export default TodoDetails