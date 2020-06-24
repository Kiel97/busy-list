import React from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';
import IconOct from 'react-native-vector-icons/Octicons';

function ToDoListItem(props) {
    const id = props.id;

    return(
        <TouchableOpacity style={styles.listItem} onPress={props.onPress} onLongPress={props.onLongPress} delayLongPress={600} activeOpacity={0.5}>
            <Text style={styles.listItemText}>{props.listName}</Text>
            <IconOct name="tasklist" color="#0097E8" size={44} style={styles.icon}/>
        </TouchableOpacity>
    );

}


const styles = StyleSheet.create({
    listItem: {
        alignSelf: 'stretch',
        backgroundColor: "#fff",
        borderRadius: 5,
        minHeight: 60,
        flexDirection: "row",
        justifyContent: "space-between",
        alignContent: "center",
        paddingHorizontal: 20,
        marginVertical: 10,
    },
    listItemText: {
        fontSize: 24,
        alignSelf: "center",
    },
    icon: {
        alignSelf: "center",
    },
});

export default ToDoListItem;