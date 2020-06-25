import React from 'react';
import { StyleSheet, Text, TouchableOpacity, CheckBox } from 'react-native';
import IconFon from 'react-native-vector-icons/Fontisto';

function TaskItem(props) {
    const id = props.id;

    const notDoneIconName = "checkbox-passive"
    const doneIconName = "checkbox-active"

    return(
        <TouchableOpacity style={[styles.listItem, styles.shadow]} onPress={props.onPress} onLongPress={props.onLongPress} delayLongPress={400} activeOpacity={0.5}>
            <IconFon onPress={props.onCheckmarkPress} name={props.done ? doneIconName : notDoneIconName} color="#0097E8" size={32} style={styles.checkbox} />
            <Text style={styles.listItemText}>{props.taskName}</Text>
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
        alignContent: "center",
        paddingHorizontal: 10,
        marginVertical: 10,
    },
    listItemText: {
        fontSize: 24,
        alignSelf: "center",
        maxWidth: 330,
    },
    checkbox: {
        alignSelf: "center",
        marginRight: 10,
        minWidth: 38,
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

export default TaskItem;