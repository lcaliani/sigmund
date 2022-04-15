const sqlite3 = require('sqlite3');
const { open } = require('sqlite');

/**
 * Clase base para interação com o banco da dados
 */
class Repository {
    constructor() {
        // TODO: separar em arquivo .env
        this.DATABASE = './database/database.db'
        this.campos = {}
        this.TABLE = ''
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
     * Busca todos os registros pelo id da tabela
     * @param {int} id Id do registro que será buscado
     * @returns {Promise<array>}
     */
    async find(id, orderBy = 'id') {
        let result = []
        const instrucao = `SELECT * FROM ${this.TABLE}
            WHERE ${this.campos.id} = ${id}
            ORDER BY ${orderBy}`
        return new Promise((resolve, reject) => {
            this.con.all(instrucao, [], (error, rows) => {
                if (error) {
                    console.warn(error)
                    reject('Erro ao recuperar os dados')
                }

                console.log(rows)
                rows.forEach((row) => {
                    result.push(row)
                })
                resolve(result)
            })
        })
    }

    /**
     * Busca todos os registros por um campo específico
     * @param {string} field Nome do campo que será buscado
     * @param {mixed} value valor do campo que será buscado
     * @returns {Promise<array>}
     */
    async findBy(field, value, orderBy = 'id') {
        const fields = Object.keys(this.campos)
        const isValidField = fields.indexOf(field) !== -1

        if (!isValidField) {
            return new Promise((resolve, reject) => {
                reject('O campo passado é inválido.')
            })
        }

        // Verificando se deve ou não usar aspas no campo
        const where = `WHERE ${field} = ` +
            typeof value === 'number' 
                ? value
                : `"${value}"`

        const instrucao = `SELECT * FROM ${this.TABLE}
            ${where}
            ORDER BY ${orderBy}`
        
        let result = []
        return new Promise((resolve, reject) => {
            this.con.all(instrucao, [], (error, rows) => {
                if (error) {
                    console.warn(error)
                    reject('Erro ao recuperar os dados')
                }

                console.log(rows)
                rows.forEach((row) => {
                    result.push(row)
                })
                resolve(result)
            })
        })
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
        console.log(query)
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