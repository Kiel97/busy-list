import React, { useEffect } from 'react'
import { StyleSheet, View, Text, TextInput, Button, Alert, TouchableOpacity } from 'react-native'
import { openDatabase } from 'react-native-sqlite-storage';
import IconAnt from 'react-native-vector-icons/AntDesign';

const db = openDatabase("busylist.db");

function ListDetails({navigation, route}) {
    const listId = route.params?.listId;
    const addOrEdit = route.params?.addOrEdit;
    const [listName, setListName] = React.useState(route.params?.listName)

    useEffect(() => {
        console.log("ListDetails: ComponentDidMount")

        return () => {
            console.log("ListDetails: ComponentWillUnmount")
        }
    }, [])

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
        <View style={styles.container}>
            <Text style={styles.modeText}>{addOrEdit==='Add' ? 'Add mode' : 'Edit mode'}</Text>
            
            <View style={styles.blueBackground}>
                <View style={styles.optionsBox} >
                    <TextInput style={styles.textInput} placeholder="Type list name here..." value={listName} onChangeText={value => setListName(value)}></TextInput>
                </View>
                <View style={styles.buttonBox}>
                    <TouchableOpacity style={styles.button} disabled={listName.trim().length < 1} onPress={() => updateListAndGoBack(listName)} >
                        <IconAnt name="check" size={50} color="#0097E8" />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.button} onPress={() => navigation.goBack()}>
                        <IconAnt name="close" size={50} color="#0097E8" />
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
    },
    button: {
        backgroundColor: "#fff",
        minWidth: 64,
        minHeight: 64,
        alignItems: 'center',
        justifyContent: 'center',
        alignSelf: 'flex-end',
        margin: 5,
        borderRadius: 5,
    },
    blueBackground: {
        flex: 1,
        marginVertical: 5,
        padding: 5,
        backgroundColor: "#0097E8"
    },
    buttonText: {
        color: "#0097E8"
    },
    buttonBox: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
    },
    textInput: {
        margin: 5,
        backgroundColor: "#fff",
        color: "#111",
        fontSize: 25,
    },
    modeText: {
        color: "#0097E8",
        fontSize: 20,
        fontWeight: 'bold',
        margin: 5,
    },
    optionsBox: {
        flex: 1,
        alignSelf: 'stretch',
        justifyContent: 'flex-start',
    },
});

export default ListDetails