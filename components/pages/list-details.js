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

        navigation.setOptions({title: `List Details - ${addOrEdit==="Add" ? "Add mode" : "Edit mode"}`})

        return () => {
            console.log("ListDetails: ComponentWillUnmount")
        }
    }, [])

    const addNewListAndGoBack = (listName) => {
        const newListName = listName.trim()

        db.transaction(tx => {
            tx.executeSql('INSERT INTO "lists" ("listName") VALUES (?);',
            [newListName],
            (tx, results) => {
              console.log("addNewListAndGoBack: Affected " + results.rowsAffected);
              Alert.alert('Add new list',
                            'Successfully add new list',
                            [
                                {
                                    text: 'OK',
                                    onPress: () => navigation.goBack(),
                                },
                            ]
                        )
            }
            );
        }, function(error) {
            console.log('addNewListAndGoBack ERROR: ' + error.message)
        }, function() {
            console.log('addNewListAndGoBack OK')
        });
    }

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

    const acceptOption = () => {
        if (addOrEdit==="Add"){
            addNewListAndGoBack(listName)
        }
        else if (addOrEdit==="Edit"){
            updateListAndGoBack(listName)
        }
        else{
            console.log("Unknown addOrEdit status:", addOrEdit)
        }
    }

    return (
        <View style={styles.container}>
            <Text style={styles.modeText}>{addOrEdit==='Add' ? 'Add mode' : 'Edit mode'}</Text>
            
            <View style={styles.blueBackground}>
                <View style={styles.optionsView} >
                    <TextInput style={styles.textInput} placeholder="Type list name here..." value={listName} onChangeText={value => setListName(value)}></TextInput>
                </View>
                <View style={styles.buttonView}>
                    <TouchableOpacity style={[styles.buttonBase, listName.trim().length < 1 ? styles.buttonDisabled : styles.buttonActive, styles.shadow]} disabled={listName.trim().length < 1} onPress={() => acceptOption()} >
                        <IconAnt name="check" size={40} color="#fff" />
                    </TouchableOpacity>

                    <TouchableOpacity style={[styles.buttonBase, styles.buttonActive, styles.shadow]} onPress={() => navigation.goBack()}>
                        <IconAnt name="close" size={40} color="#fff" />
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
    buttonActive: {
        backgroundColor: "#E85100",
    },
    buttonDisabled: {
        backgroundColor: "#ABABAB",
    },
    buttonBase: {
        minWidth: 54,
        minHeight: 54,
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
    buttonView: {
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
    optionsView: {
        flex: 1,
        alignSelf: 'stretch',
        justifyContent: 'flex-start',
    },
    shadow: {
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
});

export default ListDetails