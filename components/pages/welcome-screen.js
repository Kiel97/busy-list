import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ImageBackground } from 'react-native';
import { openDatabase } from 'react-native-sqlite-storage';

const db = openDatabase("busylist.db");
const forceDBReinit = false;         // set it to `true` to reinitialize tables
const prepopulateDB = false;         // set it to `true` to prepopulate tables after recreating tables

function WelcomeScreen({navigation, route}){
  React.useEffect(() => {
    db.transaction(function(txn) {
      txn.executeSql(
        "SELECT name FROM sqlite_master WHERE type='table' AND (name='lists' OR name='tasks')",
        [],
        function(tx, res) {
          console.log('SQLite tables amount:', res.rows.length);
          console.log('SQLite forceDBReinit:', forceDBReinit);
          if (res.rows.length < 2 || forceDBReinit) {
            txn.executeSql('DROP TABLE IF EXISTS "lists"', []);
            txn.executeSql('DROP TABLE IF EXISTS "tasks"', []);
            txn.executeSql(
              'CREATE TABLE IF NOT EXISTS "lists"("id" INTEGER NOT NULL UNIQUE,"listName" TEXT NOT NULL, PRIMARY KEY("id" AUTOINCREMENT));',
              []
            );
            txn.executeSql(
              'CREATE TABLE IF NOT EXISTS "tasks"("id" INTEGER NOT NULL UNIQUE, "listId" INTEGER NOT NULL, "taskName" TEXT NOT NULL, "done" INTEGER NOT NULL DEFAULT 0 CHECK("done"=0 OR "done"=1), PRIMARY KEY("id" AUTOINCREMENT), FOREIGN KEY("listId") REFERENCES "lists"("id") ON DELETE CASCADE);',
              []
            );
            if (prepopulateDB) {
              tx.executeSql(
                'INSERT INTO "lists" ("id", "listname") VALUES (?,?),(?,?),(?,?),(?,?)',
                [1, 'Spotkanie z Tomaszem', 2, 'Lista zakupów', 3, 'Projekt z RN', 4, 'Prace w ogrodzie'],
                (tx, results) => {
                  if (results.rowsAffected > 0) {
                    console.log('Prepopulate "lists": Insert success');
                  } else {
                    console.log('Prepopulate "lists": Insert failed');
                  }
                }
              );
              tx.executeSql(
                'INSERT INTO "tasks" ("id", "listId", "taskName", "done") VALUES (?,?,?,?),(?,?,?,?),(?,?,?,?),(?,?,?,?),(?,?,?,?),(?,?,?,?),(?,?,?,?),(?,?,?,?),(?,?,?,?),(?,?,?,?)',
                [
                  1, 1, 'Przygotowanie sprawozdania końcowego', 1,
                  2, 1, 'Organizacja spotkania w firmie', 0,
                  3, 2, 'Świeczki', 1,
                  4, 2, 'Prezent na urodziny', 0,
                  5, 2, 'Tort urodzinowy', 0,
                  6, 3, 'Przejścia między ekranami', 1,
                  7, 3, 'Integracja z bazą SQLite', 1,
                  8, 3, 'Pobieranie zadań z Bored API', 1,
                  9, 3, 'Sprawozdanie', 0,
                  10, 3, 'Wysłanie projektu', 0,
                ],
                (tx, results) => {
                  if (results.rowsAffected > 0) {
                    console.log('Prepopulate "tasks": Insert success');
                  } else {
                    console.log('Prepopulate "tasks": Insert failed');
                  }
                }
              );
            }
          }
        }
      );
    }, function(error) {
      console.log('WelcomeScreen-useEffect ERROR: ' + error.message)
  }, function() {
      console.log('WelcomeScreen-useEffect OK')
  }
    );
  }, []);

    return (
        <ImageBackground style={styles.container} source={require('../../assets/images/background5.jpg')} imageStyle={styles.imageStyle} >
            <TouchableOpacity style={styles.containerClickable} onPress={() => navigation.navigate('Your Lists')} activeOpacity={0.7}>
              <Text style={styles.textTitle}>Busy List</Text>
              <Text style={styles.textStandard}>No idea what to do? No more!</Text>
              <View style={{marginVertical: 10}} />
              <Text style={styles.textStandard}>Click to continue</Text>
            </TouchableOpacity>
            <View style={styles.appInfo}>
                <Text style={styles.appInfoText}>Version 1.0, June 2020 by Krzysztof Kiełczewski</Text>
            </View>
        </ImageBackground>
      );
    
}

const styles = StyleSheet.create({
    container: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#0097E8',
    },
    imageStyle: {
      opacity: 0.1,
    },
    containerClickable: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    textStandard: {
      color: "#fff",
      fontSize: 18,
    },
    textTitle: {
      fontSize: 50,
      fontWeight: "bold",
      color: "#fff",
    },
    appInfo: {
      justifyContent: 'flex-end',
      alignSelf: 'flex-start',
      margin: 5,
    },
    appInfoText: {
      color: "#fff",
      fontSize: 16,
    },

});

export default WelcomeScreen;