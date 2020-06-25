import React, { useEffect, useCallback, useLayoutEffect } from 'react';
import { StyleSheet, Text, View, Alert, ActivityIndicator, ImageBackground } from 'react-native';
import { FlatList } from 'react-native-gesture-handler';
import Toast from 'react-native-simple-toast';
import { openDatabase } from 'react-native-sqlite-storage';
import { FloatingAction } from "react-native-floating-action";
import Dialog from "react-native-dialog";
import IconIon from 'react-native-vector-icons/Ionicons';
import { HeaderButtons, HiddenItem, OverflowMenu } from 'react-navigation-header-buttons';

import TaskItem from '../task-item';

const db = openDatabase("busylist.db");

function TasksScreen({navigation, route}){
    const [state, setState] = React.useState({
        data: []
    });
    const [fetchIndicator, setFetchIndicator] = React.useState(false)
    const [doneTasksCount, setDoneTasksCount] = React.useState(0)
    const [allTasksCount, setAllTasksCount] = React.useState(0)

    const currentListId = route.params?.listId;
    const currentListName = route.params?.listName;

    useEffect(() => {
        console.log("TasksScreen: ComponentDidMount")
        const unsubscribe = navigation.addListener('focus', () => {
            console.log("Refresh Task list")
            FetchTasksByListId(currentListId);
            
            navigation.setOptions({ title: `${currentListName} Tasks` })
        });
        
        return unsubscribe
    }, [navigation]);

    useLayoutEffect(() => {
        navigation.setOptions({
          headerRight: () => (
            <HeaderButtons>
              <OverflowMenu style={{ marginHorizontal: 10 }} OverflowIcon={<IconIon name="ios-more" size={23} color="#0097E8" />}>
                <HiddenItem title="Delete all tasks" onPress={showDeleteAllDialog} />
                <HiddenItem title="Edit list options" onPress={showListOptions} />
                <HiddenItem title="Help" onPress={showAppHelp} />
              </OverflowMenu>
            </HeaderButtons>
          ),
        });
      }, [navigation]);

    const showListOptions = () => {
        navigation.navigate('List Details', {listId: currentListId, listName: currentListName, addOrEdit: 'Edit'})
    }

    const showAppHelp = () => {
        alert('Pomoc')
    }

    const FetchTasksByListId = (listId) => {
        db.transaction(tx => {
            tx.executeSql('SELECT * FROM "tasks" WHERE "tasks"."listId"=?',
            [listId],
            (tx, results) => {
              var fetchedData = [];
              console.log(`FetchTasksByListId: Fetched ${results.rows.length} tasks`)
              for (let i = 0; i < results.rows.length; ++i) {
                fetchedData.push(results.rows.item(i));
              }
              setState({data: fetchedData})
              setAllTasksCount(fetchedData.length)
              setDoneTasksCount(fetchedData.filter(item => item.done === 1).length)
            });
        }, function(error) {
            console.log('FetchTasksByListId ERROR: ' + error.message)
            showAlert('FetchTasksByListId ERROR', error.message)
        }, function() {
            console.log('FetchTasksByListId OK')
        }
        );
    }

    const changeDoneStatus = (taskId) => {
        let currentDoneState = (state.data.find(item => item.id == taskId)).done;
        currentDoneState = currentDoneState == 1 ? 0 : 1;
        console.log("taskId:", taskId, ",currentDoneState:", currentDoneState)
        db.transaction(tx => {
            tx.executeSql('UPDATE "tasks" SET "done"=? WHERE "tasks"."id"=?',
            [currentDoneState, taskId],
            (tx, results) => {
                console.log("changeDoneStatus: Affected " + results.rowsAffected);
                if (results.rowsAffected > 0){
                  tx.executeSql('SELECT * FROM "tasks" WHERE "tasks"."listId"=?',
                  [currentListId],
                  (tx, results) => {
                  var fetchedData = [];
                  console.log(`changeDoneStatus: Fetched ${results.rows.length} tasks`)
                  for (let i = 0; i < results.rows.length; ++i) {
                      fetchedData.push(results.rows.item(i));
                  }
                  setState({data: fetchedData})
                  setAllTasksCount(fetchedData.length)
                  setDoneTasksCount(fetchedData.filter(item => item.done === 1).length)
                  });
              }
              });
        }, function(error) {
            console.log('changeDoneStatus ERROR: ' + error.message)
            showAlert('changeDoneStatus ERROR', error.message)
        }, function() {
            console.log('changeDoneStatus OK')
        }
        );
    }

    const addNewTask = (taskName) => {
        const newTaskName = taskName.trim() || "New task"
        db.transaction(tx => {
            tx.executeSql('INSERT INTO "tasks" ("listId", "taskName", "done") VALUES (?,?,?);',
            [currentListId, newTaskName, 0],
            (tx, results) => {
              console.log("addNewTask: Affected " + results.rowsAffected);
              if (results.rowsAffected > 0){
                tx.executeSql('SELECT * FROM "tasks" WHERE "tasks"."listId"=?',
                [currentListId],
                (tx, results) => {
                var fetchedData = [];
                console.log(`addNewTask: Fetched ${results.rows.length} tasks`)
                for (let i = 0; i < results.rows.length; ++i) {
                    fetchedData.push(results.rows.item(i));
                }
                setState({data: fetchedData})
                setAllTasksCount(fetchedData.length)
                setDoneTasksCount(fetchedData.filter(item => item.done === 1).length)
                });
            }
            });
        }, function(error) {
            console.log('addNewTask ERROR: ' + error.message)
            showAlert('addNewTask ERROR', error.message)
        }, function() {
            console.log('addNewTask OK')
        }
        );

        Toast.show('Successfully added new To-Do item.');
    }

    const showDeleteDialog = useCallback((taskId, taskName) =>{
        Alert.alert(
            "Confirm deletion",
            `Are you sure you want to delete ${taskName} task (id:${taskId}})?`,
            [
                {
                    text: 'No',
                    onPress: () => console.log(`Don't delete ${taskId}!`),
                    style: 'cancel',
                },
                {
                    text: 'Yes',
                    onPress: () => {deleteTask(taskId)},
                },
            ]
        )
    })

    const showDeleteAllDialog = useCallback(() =>{
        Alert.alert(
            "Confirm deletion of all",
            `Are you sure you want to delete all tasks from ${currentListName} list (id:${currentListId}})? You will lose them forever!`,
            [
                {
                    text: 'No',
                    onPress: () => console.log(`Canceled deletetion of all tasks!`),
                    style: 'cancel',
                },
                {
                    text: 'Yes',
                    onPress: () => {deleteAllTasks(currentListId)},
                },
            ]
        )
    }) 
    
    const deleteTask = useCallback((taskId) => {
        db.transaction(tx => {
            tx.executeSql('DELETE FROM "tasks" WHERE "tasks"."id"=?;',
            [taskId],
            (tx, results) => {
              console.log("deleteTask: Affected " + results.rowsAffected);
              if (results.rowsAffected > 0){
                tx.executeSql('SELECT * FROM "tasks" WHERE "tasks"."listId"=?',
                [currentListId],
                (tx, results) => {
                var fetchedData = [];
                console.log(`deleteTask: Fetched ${results.rows.length} tasks`)
                for (let i = 0; i < results.rows.length; ++i) {
                    fetchedData.push(results.rows.item(i));
                }
                setState({data: fetchedData})
                setAllTasksCount(fetchedData.length)
                setDoneTasksCount(fetchedData.filter(item => item.done === 1).length)
                });
              }
              else {
                showAlert('deleteTask OK', 'No rows affected')
              }
            });
        }, function(error) {
            console.log('deleteTask ERROR: ' + error.message)
            showAlert('deleteTask ERROR', error.message)
        }, function() {
            console.log('deleteTask OK')
        }
        );

        Toast.show('Successfully removed selected task.');
    })

    const deleteAllTasks = useCallback((listId) => {
        db.transaction(tx => {
            tx.executeSql('DELETE FROM "tasks" WHERE "tasks"."listId"=?;',
            [listId],
            (tx, results) => {
              console.log("deleteAllTasks: Affected " + results.rowsAffected);
              if (results.rowsAffected > 0){
                tx.executeSql('SELECT * FROM "tasks" WHERE "tasks"."listId"=?',
                [currentListId],
                (tx, results) => {
                var fetchedData = [];
                console.log(`deleteAllTasks: Fetched ${results.rows.length} tasks`)
                for (let i = 0; i < results.rows.length; ++i) {
                    fetchedData.push(results.rows.item(i));
                }
                setState({data: fetchedData})
                setAllTasksCount(fetchedData.length)
                setDoneTasksCount(fetchedData.filter(item => item.done === 1).length)

                Toast.show('Successfully removed all tasks.');
                });
              }
              else {
                Toast.show('Your list is empty. No tasks to delete.')
              }
            });
        }, function(error) {
            console.log('deleteAllTasks ERROR: ' + error.message)
            showAlert('deleteAllTasks ERROR', error.message)
        }, function() {
            console.log('deleteAllTasks OK')
        }
        );

        
    })

    async function addRandomTask() {
        setFetchIndicator(true)
        try {
          const response = await fetch('http://www.boredapi.com/api/activity/');
          const jayson = await response.json()
          console.log(jayson.activity);
          addNewTask(jayson.activity);
          setFetchIndicator(false)
        }
        catch (err) {
          console.log('addRandomTask: Fetch Failed:', err);
          showAlert('addRandomTask Fetch Failed:', err.toString())
          setFetchIndicator(false)
        }
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
        <ImageBackground style={styles.container} source={require('../../assets/images/background1.jpg')} imageStyle={styles.imageStyle}>
            <View style={styles.topInfoView}>
                <Text style={styles.textCounter}>Completed Tasks: {doneTasksCount}/{allTasksCount}</Text>
                <ActivityIndicator animating={fetchIndicator} size={'large'} color="#fff" />
            </View>
            <FlatList style={styles.scrollViewOfLists}
                data={state.data}
                extraData={state.data}
                keyExtractor={item => item.id.toString()}
                renderItem={({ item }) => (
                    <TaskItem id={item.id} taskName={item.taskName} done={item.done}
                        onPress={() => navigation.navigate('Task Details', {taskId: item.id, taskName: item.taskName, listId: item.listId, addOrEdit: "Edit"})}
                        onCheckmarkPress={() => {changeDoneStatus(item.id)}}
                        onLongPress={() => {showDeleteDialog(item.id, item.taskName)}}
                    />)}
            />
            
            <FloatingAction
                color='#E85100'
                actions={[
                    {
                        color: "#E85100",
                        text: "Get Random Task",
                        name: "bt_randomtaskbutton",
                        icon: require('../../assets/images/dice-5.png'),
                        position: 2,
                    },
                    {
                        color: "#E85100",
                        text: "Add New Task",
                        name: "bt_addnewbutton",
                        icon: require('../../assets/images/add.png'),
                        position: 1,
                      },
                ]}
                onPressItem={name => {
                    console.log(`selected button: ${name}`);
                    if (name==="bt_randomtaskbutton")
                        addRandomTask()
                    else if (name==="bt_addnewbutton")
                        navigation.navigate('Task Details', {listId: currentListId, taskName: '', addOrEdit: "Add"})
                    else
                        console.log('Unknown option')
                }}
            />
        </ImageBackground>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0097E8',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 10,
    },
    textStandard: {
        color: "#fff",
    },
    scrollViewOfLists: {
        flex:1,
        alignSelf: 'stretch',
        marginVertical: 10,
        alignContent: "flex-start",
    },
    buttonBox: {
        flexDirection: 'row',
        alignSelf:'flex-end',
    },
    button: {
        minWidth: 64,
        minHeight: 64,
        backgroundColor: "#fff",
        alignSelf: "flex-end",
        borderRadius: 5,
        justifyContent: "center",
        marginLeft: 5,
    },
    buttonIcon: {
        alignSelf:"center",
    },
    textCounter: {
        color: "#fff",
        fontSize: 20,
        alignSelf: 'flex-start',
        fontWeight: 'bold',
    },
    topInfoView: {
        flexDirection: "row",
        alignSelf: 'stretch',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    imageStyle: {
        opacity: 0.1,
    },
});

export default TasksScreen;