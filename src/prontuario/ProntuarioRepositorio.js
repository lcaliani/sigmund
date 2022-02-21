const db = require('../../database/conexao');

const Repositorio = require('../Repositorio')

class ProntuarioRepositorio extends Repositorio {
    constructor() {
        super()
        this.campos = {
            id: 'id',
            nome: 'nome',
            nome_pai: 'nome_pai',
            nome_mae: 'nome_mae',
            data_nascimento: 'data_nascimento',
            cidade: 'cidade',
            endereco: 'endereco',
            data_cadastro: 'data_cadastro',
            status: 'status',
        }
        this.TABLE = 'paciente'
        this.con = db()
    }

    camposParaString() {
        return `${this.campos.nome}, ${this.campos.nome_pai}, ${this.campos.nome_mae},
            ${this.campos.data_nascimento}, ${this.campos.cidade}, ${this.campos.endereco}, ${this.campos.status}`
    }

    /**
     * 
     * @param {string} orderBy Nome do campo de ordernação
     * @returns {Promise<array>}
     */
    async index(orderBy = 'id') {
        let result = []
        const instrucao = `SELECT * FROM ${this.TABLE} WHERE ${this.campos.status} = 1 ORDER BY ${orderBy}`
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

    async update(valores = null) {
        if (!valores || (typeof valores !== 'object')) {
            return false
        }

        const {nome, nome_pai, nome_mae, data_nascimento, cidade, endereco, status, id} = valores
        const instrucao = `UPDATE ${this.TABLE} SET ${this.campos.nome} = ?, ${this.campos.nome_pai} = ?, ${this.campos.nome_mae} = ?,
            ${this.campos.data_nascimento} = ?, ${this.campos.cidade} = ?, ${this.campos.endereco} = ?, ${this.campos.status} = ?
            WHERE ${this.campos.id} = ?`

        const parametros = [nome, nome_pai, nome_mae, data_nascimento, cidade, endereco, status, id]

        return new Promise((resolve, reject) => {
            this.con.run(instrucao, parametros, (err) => {
                if (!err) {
                    console.info('Atualizado com sucesso')
                    return resolve(true)
                }
                console.warn(err) 
                return reject(false)
            })
        })
    }

    /**
     * Insere um registro no banco
     * @param {object} values Objeto chave/valor com o nome dos campos e seus valores
     * @return {Promise} true para sucesso, false para falha
     */
    async insert(valores = null) {
        if (!valores || (typeof valores !== 'object')) {
            return false
        }

        const instrucao = `INSERT INTO ${this.TABLE}(${this.camposParaString()}) VALUES (?,?,?,?,?,?,?)`
        const {nome, nome_pai, nome_mae, data_nascimento, cidade, endereco, status} = valores
        const parametros = [nome, nome_pai, nome_mae, data_nascimento, cidade, endereco, status]

        return new Promise((resolve, reject) => {
            this.con.run(instrucao, parametros, (err) => {
                if (!err) {
                    console.info('Inserido com sucesso')
                    return resolve(true)
                }
                console.warn(err) 
                return reject(false)
            })
        })
    }

    /**
     * Inativa o registro do banco de dados
     * @param {int} id Id do registro que será inativado
     * @return {Promise} true para sucesso, false para falha
     */
    async delete(id = null) {
        if (!id) {
            return false
        }

        const instrucao = `UPDATE ${this.TABLE} SET ${this.campos.status} = 0 WHERE id = ?`

        return new Promise((resolve, reject) => {
            this.con.run(instrucao, [id], (err) => {
                if (!err) {
                    console.info('Inativado com sucesso')
                    return resolve(true)
                }
                console.warn(err)
                return reject(false)
            })
        })
    }
}

module.exports = ProntuarioRepositorio