const { existsSync, copyFileSync } = require('fs');
const path = require('path');

const sqlite3 = require('sqlite3').verbose()

module.exports = () => {
    const buildDatabaseFile = prepareDatabase()
    const connection = new sqlite3.Database(
        buildDatabaseFile,
        (error) => {
            if (error) {
                console.error('Erro ao estabelecer conexão com o banco de dados ', error);
                console.log('database path: ', buildDatabaseFile)
            } else {
                console.log('✔ Conectou corretamente no banco ✔', 'path: ' + buildDatabaseFile)
            }
        }
    )
    
    // To avoid SQLITE_BUSY: database is locked
    connection.configure('busyTimeout', 2000)

    return connection
}

/**
 * Ao criar o build, é gerado um arquivo app.asar. O diretório em que ele se
 * encontra é somente leitura, por isso, é necessário criar uma cópia do
 * banco dentro de `process.env.databasePath`, que é o path correto para isso.
 * @returns {string} Caminho do arquivo de banco de dados
 */
const prepareDatabase = () => {
    const databaseFile = path
        .join(__dirname, './database.db')
        .replace('/app.asar', '')
        .replace('\\app.asar', ''); // Para funcionar corretamente no windows

    const buildDatabaseFile = path
        .join(process.env.databasePath, './database.db')
        .replace('/app.asar', '')
        .replace('\\app.asar', ''); // Para funcionar corretamente no windows

    if (!existsSync(buildDatabaseFile)) {
        copyFileSync(databaseFile, buildDatabaseFile)
        const copiedWithSuccess = existsSync(buildDatabaseFile)

        if (!copiedWithSuccess) {
            return null
        }
    }

    return buildDatabaseFile
}