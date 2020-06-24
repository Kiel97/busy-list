import React, { useCallback, useEffect, useLayoutEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Alert, TextInput } from 'react-native';
import { FlatList } from 'react-native-gesture-handler';
import IconIon from 'react-native-vector-icons/Ionicons';
import Toast from 'react-native-simple-toast';
import { openDatabase } from 'react-native-sqlite-storage';
import Dialog from "react-native-dialog";
import ToDoListItem from '../todo-list-item';
import { SearchBar } from 'react-native-elements'
import { FloatingAction } from "react-native-floating-action";
import { HeaderButtons, HeaderButton, Item, HiddenItem, OverflowMenu } from 'react-navigation-header-buttons';

const db = openDatabase("busylist.db");

function ListsScreen({navigation, route}){
    
    const [state, setState] = React.useState({});
    const [dialogVisible, setDialogVisible] = React.useState(false);
    const [listNameInput, setListNameInput] = React.useState('');
    const [searchText, setSearchText] = React.useState('');
    const [searchBarVisible, setSearchBarVisible] = React.useState(false);
    // const [highestUsedId, setHighestUsedId] = React.useState(0);        // TEMP: Get rid of this when replacing with SQLite DB

    useEffect(() => {
        console.log("ListsScreen: ComponentDidMount");

        FetchAllTodoLists();

        return () => {
            console.log("ListsScreen: ComponentWillUnmount");
        }

    }, []);

    useLayoutEffect(() => {
        navigation.setOptions({
          headerRight: () => (
            <HeaderButtons>
              <OverflowMenu style={{ marginHorizontal: 10 }} OverflowIcon={<IconIon name="ios-more" size={23} color="#0097E8" />}>
                <HiddenItem title="Toggle Search Bar..." onPress={toggleSearchBarVisibility} />
                <HiddenItem title="Delete all lists" onPress={deleteAllLists} />
                <HiddenItem title="App Options" onPress={showAppOptions} />
                <HiddenItem title="Help" onPress={showAppHelp} />
              </OverflowMenu>
            </HeaderButtons>
          ),
        });
      }, [navigation]);
    
    const toggleSearchBarVisibility = () => {
        setSearchBarVisible(searchBarVisible => !searchBarVisible)
    }

    const deleteAllLists = () => {
        alert('Usuń wszystko!!!')
    }

    const showAppOptions = () => {
        alert('Opcje ekranu ListsScreen')
    }

    const showAppHelp = () => {
        alert('Pomoc')
    }

    const updateSearchText = (newText) => {
        console.log('searchText:', newText)
        setSearchText(newText)

        if (!newText)
            FetchAllTodoLists();
        else{
            var fetchedData = [];
            db.transaction(tx => {
                tx.executeSql('SELECT DISTINCT "lists"."id", "lists"."listName" FROM "lists" JOIN "todos" ON "lists"."id"="todos"."listId" WHERE "lists"."listName" LIKE ? OR "todos"."taskName" LIKE ?',
                [`%${newText}%`, `%${newText}%`],
                (tx, results) => {
                  console.log(`updateSearchText: Fetched ${results.rows.length} lists`)
                  for (let i = 0; i < results.rows.length; ++i) {
                    fetchedData.push(results.rows.item(i));
                  }
                  setState({data: fetchedData})
                  });
            }, function(error) {
                console.log('updateSearchText ERROR: ' + error.message)
                showAlert('updateSearchText ERROR', error.message)
            }, function() {
                console.log('updateSearchText OK')
            }
            );
        }
    }

    const FetchAllTodoLists = () => {
        console.log("Fetching All ToDo Lists...")
        // var fetchedData = [
        //     {id: 1, listName: "Lista", doneCount: 21, allCount: 37},
        //     {id: 2, listName: "Druga Lista", doneCount: 3, allCount: 5},
        //     {id: 3, listName: "Do zrobienia", allCount: 5},
        //     {id: 4, listName: "Mobilki"},
        // ]
        var fetchedData = [];
        db.transaction(tx => {
            tx.executeSql('SELECT * FROM "lists"', [], (tx, results) => {
              console.log(`FetchAllTodoLists: Fetched ${results.rows.length} lists`)
              for (let i = 0; i < results.rows.length; ++i) {
                fetchedData.push(results.rows.item(i));
              }
              setState({data: fetchedData})
              });
        }, function(error) {
            console.log('FetchAllTodoLists ERROR: ' + error.message)
            showAlert('FetchAllTodoLists ERROR', error.message)
        }, function() {
            console.log('FetchAllTodoLists OK')
        }
        );

        // setHighestUsedId(fetchedData.length+1);
    }

    const addNewList = useCallback((listName) => {
        const newListName = listName.trim()
        if (!newListName){
            showAlert('Empty list name provided', 'You must provide non-empty list name')
            return
        }
        // var data = state.data;
        // data.push({id: highestUsedId+1, listName: newListName})
        // setState({data: data})
        // setHighestUsedId(highestUsedId+1);
        // console.log("HighestUsedId: " + highestUsedId)

        db.transaction(tx => {
            tx.executeSql('INSERT INTO "lists" ("listName") VALUES (?);',
            [newListName],
            (tx, results) => {
              console.log("addNewList: Affected " + results.rowsAffected);
              if (results.rowsAffected > 0){
                tx.executeSql('SELECT * FROM "lists"', [], (tx, results) => {
                    console.log(`addNewList: Fetched ${results.rows.length} lists`)
                    var fetchedData = [];
                    for (let i = 0; i < results.rows.length; ++i) {
                      fetchedData.push(results.rows.item(i));
                    }
                    setState({data: fetchedData})
                });
            }
            });
        }, function(error) {
            console.log('addNewList ERROR: ' + error.message)
            showAlert('addNewList ERROR', error.message)
        }, function() {
            console.log('addNewList OK')
        }
        );
        setDialogVisible(false)
        setListNameInput('')

        Toast.show('Successfully created new To-Do list.');
    })

    const showAddDialog = () => {
        console.log("showAddDialog")
        setDialogVisible(true)
        setListNameInput('')
    }

    const closeAddDialog = () => {
        console.log("closeAddDialog")
        setDialogVisible(false)
        setListNameInput('')
    }

    const deleteList = useCallback((listId) => {
        // var data = state.data.filter(item => item.id !== listId);
        // setState({data: data})

        db.transaction(tx => {
            tx.executeSql('DELETE FROM "lists" WHERE "lists"."id"=?;',
            [listId],
            (tx, results) => {
              console.log("deleteList: Affected " + results.rowsAffected);
              if (results.rowsAffected > 0){
                tx.executeSql('SELECT * FROM "lists"', [], (tx, results) => {
                    console.log(`deleteList: Fetched ${results.rows.length} lists`)
                    var fetchedData = [];
                    for (let i = 0; i < results.rows.length; ++i) {
                      fetchedData.push(results.rows.item(i));
                    }
                    setState({data: fetchedData})
                    setSearchText('')
                });
              }
              else {
                showAlert('deleteList OK', 'No rows affected')
              }
            });
        }, function(error) {
            console.log('deleteList ERROR: ' + error.message)
            showAlert('deleteList ERROR', error.message)
        }, function() {
            console.log('deleteList OK')
        }
        );

        Toast.show('Successfully removed selected task');
    })

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

    const showDeleteDialog = useCallback((listId, listTitle) =>{
        Alert.alert(
            "Confirm deletion",
            `Are you sure you want to delete ${listTitle} list (id: ${listId})?`,
            [
                {
                    text: 'No',
                    onPress: () => console.log(`Don't delete ${listId}!`),
                    style: 'cancel',
                },
                {
                    text: 'Yes',
                    onPress: () => {deleteList(listId)},
                },
            ]
        )
    })

    return (
        <View style={styles.container}>
            <View style={styles.searchBarView}>
                { searchBarVisible &&
                <SearchBar placeholder="Search for lists or tasks..."
                    onChangeText={updateSearchText}
                    value={searchText}
                    lightTheme={true}
                    placeholderTextColor="#0097E8"
                    platform="android"/>}
            </View>
            <FlatList style={styles.scrollViewOfLists}
                data={state.data}
                extraData={state.data}
                keyExtractor={item => item.id.toString()}
                renderItem={({ item }) => (
                    <ToDoListItem id={item.id} listName={item.listName}
                        onPress={()=>navigation.navigate('Your Todos', {listId: item.id, listName: item.listName, headerTitle: `${item.listName || 'List'}'s tasks`})}
                        onLongPress={() => showDeleteDialog(item.id, item.listName)}
                    />)}
            />

            <Dialog.Container visible={dialogVisible} {...{onBackdropPress: () => {setDialogVisible(false)}}}>
                <Dialog.Title>Add new To-Do list</Dialog.Title>
                <Dialog.Description>Type a name for your new list</Dialog.Description>
                <Dialog.Input value={listNameInput} onChangeText={text => setListNameInput(text)} />
                <Dialog.Button label="Cancel" onPress={() => closeAddDialog}/>
                <Dialog.Button label="Submit" onPress={() => addNewList(listNameInput)}/>
            </Dialog.Container>

            {/* <View style={styles.buttonBox}>
                <TouchableOpacity style={styles.button} onPress={() => setSearchBarVisible(!searchBarVisible)}>
                    <IconIon name="md-search" size={64} color="#0097E8" style={styles.buttonIcon}/>
                </TouchableOpacity>
            </View> */}

            <FloatingAction
                color='#E85100'
                actions={[
                    {
                        color: "#E85100",
                        text: "Add New To-Do list",
                        name: "bt_addnewbuttonl",
                        icon: require('../../assets/images/add.png'),
                        position: 1,
                    },
                ]}
                overrideWithAction
                onPressItem={name => {
                        showAddDialog()
                }}
            />

        </View>
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
    searchBarView: {
        alignSelf: 'stretch',
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
        alignSelf: "center",
    },
});

export default ListsScreen;