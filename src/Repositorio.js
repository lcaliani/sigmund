const db = require('../database/conexao')

/**
 * Clase base para interação com o banco da dados
 */
class Repository {
    constructor() {
        this.campos = {}
        this.TABLE = ''
        this.connection = db()
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
            this.connection.all(instrucao, [], (error, rows) => {
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
            this.connection.all(instrucao, [], (error, rows) => {
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
        let result = []
        return new Promise((resolve, reject) => {
            this.connection.all(query, [], (error, rows) => {
                if (error) {
                    console.warn(error)
                    reject('Erro ao recuperar os dados')
                }

                console.log(rows)
                rows.forEach((row) => {
                    result.push(row)
                })
                console.log('resultados porra', result)
                resolve(result)
            })
        })
    }
}

module.exports = Repository