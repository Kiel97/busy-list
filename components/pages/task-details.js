import React, { useEffect } from 'react'
import { StyleSheet, View, Text, TextInput, ImageBackground, Alert, TouchableOpacity } from 'react-native'
import { openDatabase } from 'react-native-sqlite-storage';
import IconAnt from 'react-native-vector-icons/AntDesign';

const db = openDatabase("busylist.db");

function TaskDetails({navigation, route}) {
    const taskId = route.params?.taskId;
    const listId = route.params?.listId;
    const addOrEdit = route.params?.addOrEdit;
    const [taskName, setTaskName] = React.useState(route.params?.taskName)

    useEffect(() => {
        console.log("TaskDetails: ComponentDidMount")

        navigation.setOptions({title: `Task Details - ${addOrEdit==="Add" ? "Add mode" : "Edit mode"}`})

        return () => {
            console.log("TaskDetails: ComponentWillUnmount")
        }
    }, [])

    const addNewTaskAndGoBack = (taskName) => {
        const newTaskName = taskName.trim()
        db.transaction(tx => {
            tx.executeSql('INSERT INTO "tasks" ("listId", "taskName", "done") VALUES (?,?,?);',
            [listId, newTaskName, 0],
            (tx, results) => {
                console.log("addNewTaskAndGoBack: Affected", results.rowsAffected)
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
            console.log('addNewTaskAndGoBack ERROR: ' + error.message)
            showAlert('addNewTaskAndGoBack ERROR', error.message)
        }, function() {
            console.log('addNewTaskAndGoBack OK')
        }
        );
    }

    const updateTaskAndGoBack = (newTaskName) => {
        console.log('updateTaskAndGoBack')

        const trimmedNewTaskName = newTaskName.trim()

        db.transaction(tx => {
            tx.executeSql('UPDATE "tasks" SET "taskName"=? WHERE "tasks"."id"=?',
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
            addNewTaskAndGoBack(taskName)
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
        <View style={styles.container} >
            <Text style={styles.modeText}>{addOrEdit==='Add' ? 'Add mode' : 'Edit mode'}</Text>
            
            <ImageBackground style={styles.blueBackground} source={require('../../assets/images/background4.jpg')} imageStyle={styles.imageStyle}>
                <View style={styles.optionsView} >
                    <TextInput style={styles.textInput} placeholder="Type task name here..." value={taskName} onChangeText={value => setTaskName(value)}></TextInput>
                </View>
                <View style={styles.buttonView}>
                    <TouchableOpacity style={[styles.buttonBase, taskName.trim().length < 1 ? styles.buttonDisabled : styles.buttonActive, styles.shadow]} disabled={taskName.trim().length < 1} onPress={() => acceptAction()} >
                        <IconAnt name="check" size={40} color="#fff" />
                    </TouchableOpacity>

                    <TouchableOpacity style={[styles.buttonBase, styles.buttonActive, styles.shadow]} onPress={() => rejectAction()}>
                        <IconAnt name="close" size={40} color="#fff" />
                    </TouchableOpacity>
                </View>
            </ImageBackground>
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
    imageStyle: {
      opacity: 0.1,
    },
});

export default TaskDetails