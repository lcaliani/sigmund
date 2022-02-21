const db = require('../../../database/conexao');

const Repositorio = require('../../Repositorio')

class RespostasAnamneseRepositorio extends Repositorio {
    constructor() {
        super()
        this.campos = {
            id: 'id',
            id_roteiro: 'id_roteiro',
            id_paciente: 'id_paciente',
            resposta: 'resposta',
            data_cadastro: 'data_cadastro',
        }
        this.TABLE = 'respostas_do_roteiro_de_anamnese'
        this.con = db()
    }

    camposParaString() {
        return `${this.campos.id_roteiro}, ${this.campos.id_paciente}, ${this.campos.resposta}`
    }

    /**
     * 
     * @param {string} orderBy Nome do campo de ordernação
     * @returns {Promise<array>}
     */
    async index(orderBy = 'id') {
        let result = []
        const instrucao = `SELECT * FROM ${this.TABLE} ORDER BY ${orderBy}`
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

        const {id_roteiro, id_paciente, resposta, data_cadastro, id} = valores
        const instrucao = `UPDATE ${this.TABLE}
            SET ${this.campos.id_roteiro} = ?, ${this.campos.id_paciente} = ?, ${this.campos.resposta} = ?
            WHERE ${this.campos.id} = ?`
        

        const parametros = [id_roteiro, id_paciente, resposta, data_cadastro, id]

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

    async saveOrUpdate(perguntasPaciente = null, idPaciente = null) {
        if (!perguntasPaciente) {
            return false
        }

        // UPDATES
        let respostasJaRespondidasAnteriormenteLista = []
        let respostasJaRespondidasAnteriormente = perguntasPaciente.filter((pergunta) => pergunta.id !== null)
        respostasJaRespondidasAnteriormente.forEach(resposta => {
            let respostaUpdate = `UPDATE respostas_do_roteiro_de_anamnese SET resposta = "${resposta.resposta}" WHERE id = ${resposta.id}`
            respostasJaRespondidasAnteriormenteLista.push(respostaUpdate)
        }) 
        respostasJaRespondidasAnteriormente = respostasJaRespondidasAnteriormenteLista.join(';')
        // final: ['UPDATE ...; UPDATE ...; UPDATE ...']

        // INSERTS
        let respostasNovasLista = []
        let respostasNovas = perguntasPaciente.filter((pergunta) => pergunta.id === null)
        respostasNovas.forEach(resposta => {
            let respostaInsert = `(${resposta.id_roteiro}, ${idPaciente}, "${resposta.resposta}")`
            respostasNovasLista.push(respostaInsert)
        });
        respostasNovas = respostasNovasLista.join(',')
        const instrucaoRepostasNovas = `INSERT INTO respostas_do_roteiro_de_anamnese (id_roteiro, id_paciente, resposta) 
            VALUES ${respostasNovas}` // final: 'INSERT INTO ... VALUES (), () ...

        return new Promise((resolve, reject) => {
            let erros = []
            // UPDATES
            respostasJaRespondidasAnteriormenteLista.forEach((respostaAtualizada) => {
                this.con.run(respostaAtualizada, [], (erro) => (erro !== null) ? erros.push(erro) : null)
            })

            // INSERTS
            this.con.run(instrucaoRepostasNovas, [], (erro) => (erro !== null) ? erros.push(erro) : null)
            
            console.warn('Erros', erros)

            return (erros.length > 0) ? reject(false) : resolve(true)
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

        const instrucao = `INSERT INTO ${this.TABLE}(${this.camposParaString()}) VALUES (?,?,?)`
        const {id_roteiro, id_paciente, resposta} = valores
        const parametros = [id_roteiro, id_paciente, resposta]

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

        const instrucao = `DELETE FROM ${this.TABLE} WHERE id = ?`

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
     * Recupera as respostas das perguntas ativas do paciente
     * @param {int} idPaciente 
     * @returns {Promise<array<object>>}
     */
    async buscarRespostasPorIdDoPaciente(idPaciente) {
        const query = `SELECT *
            FROM ${this.TABLE} respostas
            JOIN roteiro_de_anamnese perguntas
            WHERE respostas.id_roteiro = perguntas.id
                AND ${this.campos.id_paciente} = ${idPaciente}
                AND perguntas.status = 1
            ORDER by ${this.campos.id}`
        return await this.all(query)
    }

}

module.exports = RespostasAnamneseRepositorio