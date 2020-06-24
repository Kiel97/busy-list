import React from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';
import IconAnt from 'react-native-vector-icons/AntDesign';

function ToDoListItem(props) {
    const id = props.id;

    return(
        <TouchableOpacity style={[styles.listItem, styles.shadow]} onPress={props.onPress} onLongPress={props.onLongPress} delayLongPress={600} activeOpacity={0.5}>
            <Text style={styles.listItemText}>{props.listName}</Text>
            <IconAnt name="hearto" color="#0097E8" size={40} style={styles.icon}/>
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

export default ToDoListItem;