import React from 'react'
import { View, Text, Button } from 'react-native'

function ListDetails({navigation, route}) {
    const listId = route.params?.listId;
    const listName = route.params?.listName;

    return (
        <View>
            <Text>{listId}</Text>
            <Text>{listName}</Text>
            <Button title="Go back" onPress={() => navigation.goBack()} />
        </View>
    )
}

export default ListDetails