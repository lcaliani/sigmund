const path = require('path');

const sqlite3 = require('sqlite3').verbose()

module.exports = () => {
    // Replace para encontrar o arquivo de banco após build
    const databaseFile = path.join(__dirname, './database.db').replace('/app.asar', '');
    const connection = new sqlite3.Database(
        databaseFile,
        (error) => {
            if (error) {
                console.log('Erro ao estabelecer conexão com o banco de dados ', error);
            } else {
                console.log('✔ Conectou corretamente no banco')
            }
        }
    )
    
    // To avoid SQLITE_BUSY: database is locked
    connection.configure('busyTimeout', 2000)

    return connection
}