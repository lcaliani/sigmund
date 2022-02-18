const sqlite3 = require('sqlite3').verbose()

module.exports = () => {
    const connection = new sqlite3.Database(
        './database/database.db',
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