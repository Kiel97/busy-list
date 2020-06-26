import React, { useEffect, useLayoutEffect } from 'react'
import { StyleSheet, View, Text, TextInput, ImageBackground, Alert, TouchableOpacity, ScrollView } from 'react-native'
import { openDatabase } from 'react-native-sqlite-storage';
import IconAnt from 'react-native-vector-icons/AntDesign';
import DropDownPicker from 'react-native-dropdown-picker';
import IconIon from 'react-native-vector-icons/Ionicons';
import { HeaderButtons, HiddenItem, OverflowMenu } from 'react-navigation-header-buttons';

const db = openDatabase("busylist.db");

function TaskDetails({navigation, route}) {
    const taskId = route.params?.taskId;
    const listId = route.params?.listId;
    const addOrEdit = route.params?.addOrEdit;
    const [listName, setListName] = React.useState('')
    const [destinationListId, setDestinationListId] = React.useState(route.params?.listId)
    const [taskData, setTaskData] = React.useState('')
    const [taskName, setTaskName] = React.useState('')
    const [taskNote, setTaskNote] = React.useState('')
    const [selectedTag, setSelectedTag] = React.useState('')
    const availableTags = [
        {label: "No tag", value: ""},
        {label: "Busy Work", value: "busywork"},
        {label: "Charity", value: "charity"},
        {label: "Cooking", value: "cooking"},
        {label: "Do It Yourself", value: "diy"},
        {label: "Education", value: "education"},
        {label: "Music", value: "music"},
        {label: "Recreational", value: "recreational"},
        {label: "Relaxation", value: "relaxation"},
        {label: "Social", value: "social"},
    ]        // const array from Bored API docs

    useEffect(() => {
        console.log("TaskDetails: ComponentDidMount")

        navigation.setOptions({title: `Task Details - ${addOrEdit==="Add" ? "Add mode" : "Edit mode"}`})
        fetchAllTaskData(taskId)
        UpdateDestinationListId(destinationListId)

        return () => {
            console.log("TaskDetails: ComponentWillUnmount")
        }
    }, [])

    useLayoutEffect(() => {
        navigation.setOptions({
          headerRight: () => (
            <HeaderButtons>
              <OverflowMenu style={styles.overflowMenu} OverflowIcon={<IconIon name="ios-more" size={23} color="#000" />}>
                <HiddenItem title="Help" onPress={showHelp} />
              </OverflowMenu>
            </HeaderButtons>
          ),
        });
    }, [navigation]);

    const showHelp = () => {
        showAlert('Tasks Screen Help',
            'Welcome to Busy List Help! Here you can see details of your tasks.\n\nHere you can be in two modes: "Add mode" and "Edit mode".\n\nIf you'+
            ' requested to add new task, you are in "Add mode". Some options/details are not visible here like timestamp of created task. To add new'+
            ' task, insert a name of list and press "Check" button. An app will add new task and redirect you to Tasks Screen. You can also enter optional note'+
            ' for you to read and select one of available tags to be easier to filter on Tasks Screen.\n\nIn other case you are'+
            ' in "Edit mode" and you are free to change this tasks\'s properties like task name, tag and note. You can also remove tag and note if you don\'t need them.'+
            ' Just play with those values on press "Check" button to save changes. You can even move your task to another list! Enter id of destination list and check'+
            ' name of list you want to move your task. An app will update your tasks\'s new properties and you will be redirected'+
            ' to Tasks Screen.\n\nTo close this popup, just press OK.')
    }

    const fetchAllTaskData = (taskId) => {
        db.transaction(tx => {
            tx.executeSql('SELECT * FROM "tasks" WHERE "tasks"."id"=?',
            [taskId],
            (tx, results) => {
                const item = results.rows.item(0)
                console.log("fetchAllTaskData: Fetched", item)
                setTaskData(item)
                setTaskName(item.taskName)
                setTaskNote(item.note)
                setSelectedTag(item.tag)
            }
            )
        }, function(error) {
            console.log('fetchAllTaskData ERROR: ' + error.message)
            Alert.alert('fetchAllTaskData ERROR',
                        error.message,
                        [
                            {
                                text: 'OK',
                                onPress: () => navigation.goBack(),
                            },
                        ])
        }, function() {
            console.log('fetchAllTaskData OK')
        })
    }

    const fetchListName = (listId) => {
        db.transaction(tx => {
            tx.executeSql('SELECT "lists"."listName" FROM "lists" WHERE "lists"."id"=?',
            [listId],
            (tx, results) => {
                if (results.rows.length===0){
                    setListName("")
                }
                else {
                    setListName(results.rows.item(0).listName)
                }
            })
        }, function(error) {
            console.log('fetchListName ERROR: ' + error.message)
            Alert.alert('fetchListName ERROR',
                        error.message,
                        [
                            {
                                text: 'OK',
                                onPress: () => navigation.goBack(),
                            },
                        ])
        }, function() {
            console.log('fetchListName OK')
        })
    }

    const addNewTaskAndGoBack = (taskName) => {
        const newTaskName = taskName.trim()
        db.transaction(tx => {
            tx.executeSql('INSERT INTO "tasks" ("listId", "taskName", "done", "note", "tag") VALUES (?,?,?,?,?);',
            [listId, newTaskName, 0, taskNote, selectedTag],
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
            tx.executeSql('UPDATE "tasks" SET "listId"=?, "taskName"=?, "note"=?, "tag"=? WHERE "tasks"."id"=?',
            [destinationListId, trimmedNewTaskName, taskNote, selectedTag, taskId],
            (tx, results) => {
                console.log("updateTaskAndGoBack: Affected", results.rowsAffected)
                Alert.alert('Update task',
                            'Successfully updated task',
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

    const UpdateDestinationListId = (newListId) => {
        setDestinationListId(newListId)
        fetchListName(newListId)
    }

    const acceptAction = () => {
        console.log('selectedTag:', selectedTag)
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

    const showAlert = (title, message) => {
        Alert.alert(
            title,
            message,
            [
                {
                    text: 'OK',
                    onPress: () => {}
                }
            ],
            { cancelable: false }
        )
    }

    return (
        <View style={styles.container} >
            <ImageBackground style={styles.blueBackground} source={require('../../assets/images/background4.jpg')} imageStyle={styles.imageStyle}>
                <ScrollView style={styles.optionsView} contentContainerStyle={styles.optionsViewContent} >
                    <Text style={styles.subheaderText}>Task name</Text>
                    <TextInput style={styles.textInput} maxLength={60} placeholder="Type task name here..." value={taskName} onChangeText={value => setTaskName(value)}/>
                    <Text style={styles.subheaderText}>Tag (if any)</Text>
                    <DropDownPicker
                        items={availableTags}
                        defaultValue={selectedTag}
                        containerStyle={styles.dropdownContainer}
                        labelStyle={styles.dropdownText}
                        style={styles.dropdown}
                        dropDownStyle={styles.dropdown}
                        onChangeItem={item => setSelectedTag(item.value)}
                    />
                    <Text style={styles.subheaderText}>Destination List: {listName}</Text>
                    { addOrEdit==="Edit" && 
                        <TextInput style={styles.textInput} placeholder="Enter list Id to move task..." value={destinationListId.toString()} onChangeText={value => UpdateDestinationListId(value)}/>
                    }
                    <Text style={styles.subheaderText}>Note</Text>
                    <TextInput style={styles.textInput} multiline={true} numberOfLines={5} maxHeight={170} placeholder="Notes for tasks..." value={taskNote} onChangeText={value => setTaskNote(value)} textAlignVertical="top"/>
                    { addOrEdit==="Edit" &&
                        <Text style={styles.subheaderText}>Created: {taskData.created}</Text>
                    }
                </ScrollView>
                <View style={styles.buttonView}>
                    <TouchableOpacity style={[styles.buttonBase, taskName.trim().length < 1 || listName.trim().length < 1 ? styles.buttonDisabled : styles.buttonActive, styles.shadow]} disabled={taskName.trim().length < 1 || listName.trim().length < 1} onPress={() => acceptAction()} >
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
        fontSize: 20,
        paddingHorizontal: 10,
        borderRadius: 3,
    },
    dropdown: {
        backgroundColor: '#fafafa',
    },
    dropdownContainer: {
        height: 45,
        marginHorizontal: 5,
    },
    dropdownText: {
        fontSize: 20,
        color: "#111",
    },
    subheaderText: {
        color: "#fff",
        fontSize: 18,
        fontWeight: 'bold',
        margin: 5,
    },
    optionsView: {
        flex: 1,
    },
    optionsViewContent:{
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
    picker: {
        backgroundColor: "#fff",
        margin: 5,
    },
    overflowMenu: {
        marginHorizontal: 10,
    },
});

export default TaskDetails