import React, { useCallback, useEffect, useLayoutEffect } from 'react';
import { StyleSheet, View, Alert, ImageBackground } from 'react-native';
import { FlatList } from 'react-native-gesture-handler';
import IconIon from 'react-native-vector-icons/Ionicons';
import Toast from 'react-native-simple-toast';
import { openDatabase } from 'react-native-sqlite-storage';
import Dialog from "react-native-dialog";
import { SearchBar } from 'react-native-elements'
import { FloatingAction } from "react-native-floating-action";
import { HeaderButtons, HiddenItem, OverflowMenu } from 'react-navigation-header-buttons';

import TaskListItem from '../task-list-item';

const db = openDatabase("busylist.db");

function ListsScreen({navigation, route}){
    
    const [state, setState] = React.useState({});
    const [searchText, setSearchText] = React.useState('');
    const [searchBarVisible, setSearchBarVisible] = React.useState(false);

    useEffect(() => {
        console.log("ListsScreen: ComponentDidMount")
        const unsubscribe = navigation.addListener('focus', () => {
            console.log("Refresh list")
            FetchAllTaskLists();

        });
        
        return unsubscribe
    }, [navigation]);

    useLayoutEffect(() => {
        navigation.setOptions({
          headerRight: () => (
            <HeaderButtons>
              <OverflowMenu style={{ marginHorizontal: 10 }} OverflowIcon={<IconIon name="ios-more" size={23} color="#0097E8" />}>
                <HiddenItem title="Toggle Search Bar..." onPress={toggleSearchBarVisibility} />
                <HiddenItem title="Delete all lists" onPress={showDeleteEverythingDialog} />
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
            FetchAllTaskLists();
        else{
            var fetchedData = [];
            db.transaction(tx => {
                tx.executeSql('SELECT DISTINCT "lists"."id", "lists"."listName" FROM "lists" JOIN "tasks" ON "lists"."id"="tasks"."listId" WHERE "lists"."listName" LIKE ? OR "tasks"."taskName" LIKE ?',
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

    const FetchAllTaskLists = () => {
        console.log("Fetching All Task Lists...")
        var fetchedData = [];
        db.transaction(tx => {
            tx.executeSql('SELECT * FROM "lists"', [], (tx, results) => {
              console.log(`FetchAllTaskLists: Fetched ${results.rows.length} lists`)
              for (let i = 0; i < results.rows.length; ++i) {
                fetchedData.push(results.rows.item(i));
              }
              setState({data: fetchedData})
              });
        }, function(error) {
            console.log('FetchAllTaskLists ERROR: ' + error.message)
            showAlert('FetchAllTaskLists ERROR', error.message)
        }, function() {
            console.log('FetchAllTaskLists OK')
        }
        );
    }

    const deleteList = useCallback((listId) => {
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

    const deleteAllLists = useCallback(() => {
        db.transaction(tx => {
            tx.executeSql('DELETE FROM "lists";',
            [],
            (tx, results) => {
              console.log("deleteAllLists: Affected " + results.rowsAffected);
              if (results.rowsAffected > 0){
                tx.executeSql('SELECT * FROM "lists"', [], (tx, results) => {
                    console.log(`deleteAllLists: Fetched ${results.rows.length} lists`)
                    var fetchedData = [];
                    for (let i = 0; i < results.rows.length; ++i) {
                      fetchedData.push(results.rows.item(i));
                    }
                    setState({data: fetchedData})
                    setSearchText('')
                    Toast.show('Successfully removed all lists with tasks');
                });
              }
              else {
                Toast.show('You have no lists to remove.');
              }
            });
        }, function(error) {
            console.log('deleteAllLists ERROR: ' + error.message)
            showAlert('deleteAllLists ERROR', error.message)
        }, function() {
            console.log('deleteAllLists OK')
        }
        );
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

    const showDeleteEverythingDialog = useCallback(() =>{
        Alert.alert(
            "Confirm deletion of all lists",
            `Are you sure you want to delete ALL LISTS and ALL TASKS from your application? You will lose them forever!`,
            [
                {
                    text: 'No',
                    onPress: () => console.log(`Canceled deletetion of all tasks!`),
                    style: 'cancel',
                },
                {
                    text: 'Yes',
                    onPress: () => {deleteAllLists()},
                },
            ]
        )
    })

    return (
        <ImageBackground style={styles.container} source={require('../../assets/images/background2.jpg')} imageStyle={styles.imageStyle}>
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
                    <TaskListItem id={item.id} listName={item.listName}
                        onPress={()=>navigation.navigate('Your Tasks', {listId: item.id, listName: item.listName})}
                        onLongPress={() => showDeleteDialog(item.id, item.listName)}
                    />)}
            />

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
                    navigation.navigate('List Details', {listName: "", addOrEdit: 'Add'})
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
    imageStyle: {
        opacity: 0.1,
    },
});

export default ListsScreen;