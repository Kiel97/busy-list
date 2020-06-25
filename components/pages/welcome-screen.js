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
              'CREATE TABLE IF NOT EXISTS "lists"("id" INTEGER NOT NULL UNIQUE,"listName" TEXT NOT NULL, "favourite" INTEGER NOT NULL DEFAULT 0 CHECK ("favourite"=0 or "favourite"=1), "created" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, PRIMARY KEY("id" AUTOINCREMENT));',
              []
            );
            txn.executeSql(
              'CREATE TABLE IF NOT EXISTS "tasks"("id" INTEGER NOT NULL UNIQUE, "listId" INTEGER NOT NULL, "taskName" TEXT NOT NULL, "done" INTEGER NOT NULL DEFAULT 0 CHECK("done"=0 OR "done"=1), "note" TEXT, "tag" TEXT, "created" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, PRIMARY KEY("id" AUTOINCREMENT), FOREIGN KEY("listId") REFERENCES "lists"("id") ON DELETE CASCADE);',
              []
            );
            if (prepopulateDB) {
              tx.executeSql(
                'INSERT INTO "lists" ("id", "listname", "favourite") VALUES (?,?,?),(?,?,?),(?,?,?),(?,?,?)',
                [
                  1, 'Spotkanie z Andrzejem', 0,
                  2, 'Lista zakupów', 0,
                  3, 'Projekt z RN', 1,
                  4, 'Prace w ogrodzie', 0
                ],
                (tx, results) => {
                  if (results.rowsAffected > 0) {
                    console.log('Prepopulate "lists": Insert success');
                  } else {
                    console.log('Prepopulate "lists": Insert failed');
                  }
                }
              );
              tx.executeSql(
                'INSERT INTO "tasks" ("id", "listId", "taskName", "done", "note", "tag") VALUES (?,?,?,?,?,?),(?,?,?,?,?,?),(?,?,?,?,?,?),(?,?,?,?,?,?),(?,?,?,?,?,?),(?,?,?,?,?,?),(?,?,?,?,?,?),(?,?,?,?,?,?),(?,?,?,?,?,?),(?,?,?,?,?,?)',
                [
                  1, 1, 'Przygotowanie sprawozdania końcowego', 0, 'Muszę koniecznie przygotować sprawozdanie, które przedstawia wyniki naszego departamentu finansów firmy', 'busywork',
                  2, 1, 'Organizacja miejsca spotkania', 1, 'Muszę znaleźć biuro odpowiednio wielkie na nasz zespół', 'busywork',
                  3, 2, 'Świeczki', 1, '', '',
                  4, 2, 'Prezent na urodziny', 0, 'Najlepiej drogi prezent', '',
                  5, 2, 'Tort urodzinowy', 0, '', 'recreational',
                  6, 3, 'Przejścia między ekranami', 1, 'Wszystko, co składa się na graficzną reprezentację aplikacji', 'busywork',
                  7, 3, 'Integracja z bazą danych', 1, 'Połączenie aplikacji z bazą danych SQLite', 'busywork',
                  8, 3, 'API Sieciowe', 1, 'Bored API świetnie będzie pasował do mojego projektu', 'busywork',
                  9, 3, 'Inne funkcjonalności', 0, 'Muszę dodać różne rzeczy jak dodawanie/edycja/przegląd opcji listy/zadania, automatyczne odświeżanie list też by się przydało', 'busywork',
                  10, 3, 'Sprawozdanie', 0, 'Sprawozdanie zawierające udokumentowanie zdjęciami i kodem zaimplementowane funkcjonalności','diy'
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