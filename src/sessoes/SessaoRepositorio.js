const db = require('../../database/conexao');

const Repositorio = require('../Repositorio')
const PacienteRepositorio = new (require('../prontuario/ProntuarioRepositorio'))

class SessaoRepositorio extends Repositorio {
    constructor() {
        super()
        this.campos = {
            id: 'id',
            id_paciente: 'id_paciente',
            descricao: 'descricao',
            data_hora_inicio: 'data_hora_inicio',
            data_hora_fim: 'data_hora_fim',
            data_cadastro: 'data_cadastro',
            status: 'status',
        }
        this.TABLE = 'sessao'
        this.con = db()
    }

    camposParaString() {
        return `${this.campos.id_paciente}, ${this.campos.descricao},
            ${this.campos.data_hora_inicio},${this.campos.data_hora_fim}, ${this.campos.status}`
    }

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

    /**
     * Retorna as sessões com o nome do paciente junto
     * @param {string} orderBy 
     * @param {int} idPaciente Id do paciente, opcional
     * @param {string} dataHoraInicio Data e hora do inicio da sessao
     * @param {string} dataHoraFim Data e hora do fim da sessão
     * @returns {Promise<array<object>>} Resultados com todos os dados da sessao + o nome do paciente
     */
    async todasComPaciente(orderBy = 'nome', idPaciente = 0, dataHoraInicio = null, dataHoraFim = null) {
        idPaciente = parseInt(idPaciente)

        let where = ''
        const idPacienteValido = idPaciente !== undefined && !Number.isNaN(idPaciente) && idPaciente != 0
        if (idPacienteValido) {
            where += ` AND ${this.campos.id_paciente} = ${idPaciente}`
        }

        const dataHoraInicioValido = dataHoraInicio !== undefined && dataHoraInicio !== null
            && (Date.parse(dataHoraInicio) !== NaN)
            console.log('valido: ', dataHoraInicioValido)
        if (dataHoraInicioValido) {
            where += ` AND ${this.campos.data_hora_inicio} >= "${dataHoraInicio}"`
        }

        const dataHoraFimValido = dataHoraFim !== undefined && dataHoraInicio !== null
            && (Date.parse(dataHoraFim) !== NaN)
        if (dataHoraFimValido) {
            where += ` AND ${this.campos.data_hora_fim} <= "${dataHoraFim}"`
        }

        const instrucao = `
            SELECT 
                ${this.TABLE}.*,
                ${PacienteRepositorio.TABLE}.${PacienteRepositorio.campos.nome} as nome_paciente
            FROM ${this.TABLE} JOIN ${PacienteRepositorio.TABLE}
            WHERE ${this.TABLE}.${this.campos.id_paciente} = ${PacienteRepositorio.TABLE}.${PacienteRepositorio.campos.id}
                AND ${this.TABLE}.${this.campos.status} = 1
                AND ${PacienteRepositorio.TABLE}.${PacienteRepositorio.campos.status} = 1
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

    async update(valores = null) {
        if (!valores || (typeof valores !== 'object')) {
            return false
        }

        const {id_paciente, descricao, data_hora_inicio,data_hora_fim, status, id} = valores
        const instrucao = `UPDATE ${this.TABLE}
            SET ${this.campos.id_paciente} = ?, ${this.campos.descricao} = ?, ${this.campos.data_hora_inicio} = ?,
                ${this.campos.data_hora_fim} = ?, ${this.campos.status} = ?
            WHERE ${this.campos.id} = ?`
        

        const parametros = [id_paciente, descricao, data_hora_inicio,data_hora_fim, status, id]

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
     * Insere um registro no banco
     * @param {object} values Objeto chave/valor com o nome dos campos e seus valores
     * @return {Promise} true para sucesso, false para falha
     */
    async insert(valores = null) {
        if (!valores || (typeof valores !== 'object')) {
            return false
        }

        const instrucao = `INSERT INTO ${this.TABLE}(${this.camposParaString()}) VALUES (?,?,?,?,?)`
        const {id_paciente, descricao, data_hora_inicio,data_hora_fim, status} = valores
        const parametros = [id_paciente, descricao, data_hora_inicio,data_hora_fim, status]

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

    /**
     * Recupera as sessões baseado em uma lista de ids
     * @param {array<int>} ids 
     * @return {Promise<array<object>>}
     */
    async findAllByIds(ids = [], orderBy = 'id') {
        ids = ids.toString()
        const instrucao = `SELECT * FROM ${this.TABLE} 
            WHERE ${this.campos.id} IN (${ids})
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
}

module.exports = SessaoRepositorio