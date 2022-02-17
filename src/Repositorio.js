const sqlite3 = require('sqlite3');
const { open } = require('sqlite');

/**
 * Clase base para interação com o banco da dados
 */
class Repository {
    constructor() {
        // TODO: separar em arquivo .env
        this.DATABASE = './database/database.db'
    }

    /**
     * Conecta no banco
     * @param {string} filename Path completo do arquivo de banco de dados
     */
    createDbConnection(filename) {
        try {
            return open({filename, driver: sqlite3.Database})
        } catch (error) {
            console.error('Erro ao conectar no banco de dados!', error)
            return null
        }
    }

    /**
     * Recupera todos os resultados da query
     * @param {string} query Query sql
     * @return {Promise<array>}
     */
    async all(query) {
        let results = []
        sqlite3.verbose()
        const database = await this.createDbConnection(this.DATABASE)
        try {
            results = await database.all(query, [])
        } catch (error) {
            console.error(error)
            database.close()
            return results
        } 

        database.close()
        return results;
    }

    /**
     * Recupera o primeiro resultado
     * @param {string} query query sql
     * @return {Promise<array>}
     */
    async first(query) {
        let results = []
        sqlite3.verbose();
        const database = await this.createDbConnection(this.DATABASE)
        try {
            results = await database.get(query, [])
        } catch (error) {
            console.error(error)
            database.close()
            return results
        }

        database.close()
        return results
    }

    /**
     * Executa a instrução sql
     * @param {string} query Query sql
     * @param {array} parameters Parametros da query
     * @return {object} Objeto informando nº de linhas alteradas, último id e
     * o próprio statement, ex: {stmt: Statement, lastID: 0, changes: 0}
     */
    async run(query, parameters = []) {
        let results = []
        sqlite3.verbose();
        const database = await this.createDbConnection(this.DATABASE)
        try {
            results = await database.run(query, parameters)
        } catch (error) {
            console.error(error)
            database.close()
            return results
        }

        database.close()
        return results
    }
}

module.exports = Repository