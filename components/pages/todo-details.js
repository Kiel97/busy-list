import React, { useEffect } from 'react'
import { StyleSheet, View, Text, TextInput, Button, Alert, TouchableOpacity } from 'react-native'
import { openDatabase } from 'react-native-sqlite-storage';
import IconAnt from 'react-native-vector-icons/AntDesign';

const db = openDatabase("busylist.db");

function TodoDetails({navigation, route}) {
    const taskId = route.params?.taskId;
    const listId = route.params?.listId;
    const addOrEdit = route.params?.addOrEdit;
    const [taskName, setTaskName] = React.useState(route.params?.taskName)

    useEffect(() => {
        console.log("TodoDetails: ComponentDidMount")

        navigation.setOptions({title: `Task Details - ${addOrEdit==="Add" ? "Add mode" : "Edit mode"}`})

        return () => {
            console.log("TodoDetails: ComponentWillUnmount")
        }
    }, [])

    const addNewTaskD = (taskName) => {
        const newTaskName = taskName.trim()
        db.transaction(tx => {
            tx.executeSql('INSERT INTO "todos" ("listId", "taskName", "done") VALUES (?,?,?);',
            [listId, newTaskName, 0],
            (tx, results) => {
                console.log("addNewTaskD: Affected", results.rowsAffected)
                Alert.alert('Add new task',
                            'Successfully added new task',
                            [
                                {
                                    text: 'OK',
                                    onPress: () => navigation.goBack(),
                                },
                            ]
                        )
            })
        }, function(error) {
            console.log('addNewTaskD ERROR: ' + error.message)
            showAlert('addNewTaskD ERROR', error.message)
        }, function() {
            console.log('addNewTaskD OK')
        }
        );
    }

    const updateTaskAndGoBack = (newTaskName) => {
        console.log('updateTaskAndGoBack')

        const trimmedNewTaskName = newTaskName.trim()

        db.transaction(tx => {
            tx.executeSql('UPDATE "todos" SET "taskName"=? WHERE "todos"."id"=?',
            [trimmedNewTaskName, taskId],
            (tx, results) => {
                console.log("updateTaskAndGoBack: Affected", results.rowsAffected)
                Alert.alert('Rename task',
                            'Successfully renamed task',
                            [
                                {
                                    text: 'OK',
                                    onPress: () => navigation.goBack(),
                                },
                            ]
                        )
            })
        }, function(error) {
            console.log('updateTaskAndGoBack ERROR: ' + error.message)
        }, function() {
            console.log('updateTaskAndGoBack OK')
        })
    }

    const acceptAction = () => {
        if (addOrEdit==="Add") {
            addNewTaskD(taskName)
        }
        else if (addOrEdit==="Edit"){
            updateTaskAndGoBack(taskName)
        }
        else {
            console.log("Unknown addOrEdit status:", addOrEdit)
        }
    }

    const rejectAction = () => {
        navigation.goBack()
    }

    return (
        <View style={styles.container}>
            <Text style={styles.modeText}>{addOrEdit==='Add' ? 'Add mode' : 'Edit mode'}</Text>
            
            <View style={styles.blueBackground}>
                <View style={styles.optionsBox} >
                    <TextInput style={styles.textInput} placeholder="Type task name here..." value={taskName} onChangeText={value => setTaskName(value)}></TextInput>
                </View>
                <View style={styles.buttonBox}>
                    <TouchableOpacity style={styles.button} disabled={taskName.trim().length < 1} onPress={() => acceptAction()} >
                        <IconAnt name="check" size={50} color="#0097E8" />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.button} onPress={() => rejectAction()}>
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

export default TodoDetails