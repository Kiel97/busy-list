import React from 'react'
import { StyleSheet, View, Text, TextInput, Button, Alert } from 'react-native'
import { openDatabase } from 'react-native-sqlite-storage';

const db = openDatabase("busylist.db");

function ListDetails({navigation, route}) {
    const listId = route.params?.listId;
    const addOrEdit = route.params?.addOrEdit;
    const [listName, setListName] = React.useState(route.params?.listName)

    const updateListAndGoBack = (newListName) => {
        console.log('updateListAndGoBack')

        const trimmedNewListName = newListName.trim()

        db.transaction(tx => {
            tx.executeSql('UPDATE "lists" SET "listName"=? WHERE "lists"."id"=?',
            [trimmedNewListName, listId],
            (tx, results) => {
                console.log("updateListAndGoBack: Affected", results.rowsAffected)
                Alert.alert('Rename list',
                            'Successfully renamed list',
                            [
                                {
                                    text: 'OK',
                                    onPress: () => navigation.navigate('Your Todos', {listId: listId, listName: trimmedNewListName}),
                                },
                            ]
                        )
            })
        }, function(error) {
            console.log('updateListAndGoBack ERROR: ' + error.message)
        }, function() {
            console.log('updateListAndGoBack OK')
        })
    }

    return (
        <View>
            <Text>{listId}</Text>
            <TextInput placeholder="Type list name here..." value={listName} onChangeText={value => setListName(value)}></TextInput>
            <Button title="Save" disabled={listName.trim().length < 1} onPress={() => updateListAndGoBack(listName)} />
            <Button title="Cancel" onPress={() => navigation.goBack()} />
        </View>
    )
}

const styles = StyleSheet.create({

});

export default ListDetails