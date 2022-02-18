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
        

        const parametros = [nome, nome_pai, nome_mae,
            data_nascimento, cidade, endereco, status, id]

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

    async atualizarComPerguntas(dadosPaciente = null, perguntasPaciente = null) {
        console.log('perguntas do paciente', perguntasPaciente)
        const dadosInvalidos = !dadosPaciente || (typeof dadosPaciente !== 'object')
        if (dadosInvalidos) {
            return false
        }

        const {nome, nome_pai, nome_mae, data_nascimento, cidade, endereco, status, id} = dadosPaciente
        const instrucaoDados = `UuPDATE ${this.TABLE} SET ${this.campos.nome} = ?, ${this.campos.nome_pai} = ?, ${this.campos.nome_mae} = ?,
            ${this.campos.data_nascimento} = ?, ${this.campos.cidade} = ?, ${this.campos.endereco} = ?, ${this.campos.status} = ?
            WHERE ${this.campos.id} = ?`
        
        const parametros = [nome, nome_pai, nome_mae,data_nascimento, cidade, endereco, status, id]






        let respostasJaRespondidasAnteriormenteLista = []
        let respostasJaRespondidasAnteriormente = perguntasPaciente.filter((pergunta) => pergunta.id !== null)
        respostasJaRespondidasAnteriormente.forEach(resposta => {
            let respostaUpdate = `UPDATE respostas_do_roteiro_de_anamnese SET resposta = ${resposta.resposta} WHERE id = ${resposta.id}`

            respostasJaRespondidasAnteriormenteLista.push(respostaUpdate)
        }) 
        respostasJaRespondidasAnteriormente = respostasJaRespondidasAnteriormenteLista.join(';')
        // final: ['UPDATE ...; UPDATE ...; UPDATE ...']





        let respostasNovasLista = []
        let respostasNovas = perguntasPaciente.filter((pergunta) => pergunta.id === null)
        respostasNovas.forEach(resposta => {
            let respostaInsert = `(${resposta.id_roteiro}, ${id}, '${resposta.resposta}')`
            respostasNovasLista.push(respostaInsert)
        });
        respostasNovas = respostasNovasLista.join(',')
        const instrucaoRepostasNovas = `INSERT INTO respostas_do_roteiro_de_anamnese (id_roteiro, id_paciente, resposta) 
            VALUES ${respostasNovas}` // final: 'INSERT INTO ... VALUES (), () ...

        
        console.log('Query de atualização do cliente', instrucaoDados)
        console.log('Instrução das respostas já existentes a serem atualizadas', respostasJaRespondidasAnteriormente)
        console.log('Instrução das respostas novas a serem inseridas', instrucaoRepostasNovas)

        this.con.serialize(()=>{

            // QUERY 1 (SELECT) - Get data 
            let promiseGetFoo = new Promise((resolve, reject) => {
                this.con.run(instrucaoDados, parametros, (erro) => {
                    if (!err) {
                        console.info('Atualizado com sucesso')
                        return resolve(true)
                    }
                    console.warn(err) 
                    return reject(false)
                })
                this.con.run(respostasJaRespondidasAnteriormente, [], (erro) => {
                    if (!err) {
                        console.info('Atualizado com sucesso')
                        return resolve(true)
                    }
                    console.warn(err) 
                    return reject(false)
                })
                this.con.run(instrucaoRepostasNovas, [], (erro) => {
                    if (!err) {
                        console.info('Atualizado com sucesso')
                        return resolve(true)
                    }
                    console.warn(err) 
                    return reject(false)
                })
              this.con.all("SELECT * FROM foo", (err, rows) => {
                if (err) {
                  console.log(err);
                  reject(err);
                } else {
                  resolve(rows);
                }
              });
            });
        
            // QUERY 2 (INSERT) - Use data from QUERY 1
            promiseGetFoo.then((res) => {
              let stmt = (res) => { 
                // code to create INSERT statement 
              }      
              this.con.run(stmt, (err) => {
                if(err) console.log(err);
                else console.log(">>> Insert DONE");
                closeDb();
              });
            });
        
        });
        
        // const parametros = [nome, nome_pai, nome_mae,data_nascimento, cidade, endereco, status, id]

        this.con.serialize(() => {
            this.con.run(instrucaoDados, parametros, (erro) => {
                console.log('Erro:', erro)
            })
            this.con.run(respostasJaRespondidasAnteriormente, [], (erro) => {
                    console.log('Erro:', erro)
            })
            this.con.run(instrucaoRepostasNovas, [], (erro) => {
                console.log('Erro:', erro)
            })
        })

        // this.con.beginTransaction(function(err, transaction) {

        //     let erros = []
            
        //     console.log(instrucaoDados + ';' + instrucaoRepostasNovas);
        //     transaction.run(instrucaoDados + ';' + instrucaoRepostasNovas,
        //         parametros, (erroNoUpdatePrincipal) => {
                
        //         // if (!erroNoUpdatePrincipal) {
        //         //     console.info('atualização de dados do paciente Atualizado com sucesso')
        //         //     // return resolve(true)
        //         // } else {
        //         //     erros.push(erroNoUpdatePrincipal)
        //         //     console.warn(erroNoUpdatePrincipal) 
        //         //     transaction.rollback((error) => {
        //         //         console.log('Fazneod rollback da atualização de dados do paciente', error)
        //         //     })
        //         //     return;
        //         // }
                
        //     })

        //     // if (respostasJaRespondidasAnteriormente.length > 0) {
        //     //     transaction.run(respostasJaRespondidasAnteriormente, [], (erroNoUpdateDePerguntas) => {
                    
        //     //         if (!erroNoUpdateDePerguntas) {
        //     //             console.info('respostas já respondidas (update) Atualizado com sucesso')
        //     //             // return resolve(true)
        //     //         } else {
        //     //             erros.push(erroNoUpdateDePerguntas)
        //     //             console.warn(erroNoUpdateDePerguntas) 
        //     //             transaction.rollback((error) => {
        //     //                 console.log('Fazneod ROLLBACK das respostas já respondidas (update)', error)
        //     //             })
        //     //             return;
        //     //         }
                    
        //     //     })
        //     // }
    

        //     // if (instrucaoRepostasNovas.length > 0) {
        //     //     transaction.run(instrucaoRepostasNovas, [], (erroNoInsertDePerguntas) => {
                    
        //     //         if (!erroNoInsertDePerguntas) {
        //     //             console.info('respostas novas (insert) Inserido com sucesso')
        //     //             // return resolve(true)
        //     //         } else {
        //     //             erros.push(erroNoInsertDePerguntas)
        //     //             console.warn(erroNoInsertDePerguntas) 
        //     //             transaction.rollback((error) => {
        //     //                 console.log('Fazneod rollback das respostas novas (insert)', error)
        //     //             })
        //     //             return;
        //     //         }
                    
        //     //     })
        //     // }

            
        //     transaction.commit((error) => {

        //         if (!error) {
        //             console.info('Transação finalizada com sucesso.', error)
        //             // return resolve(true)
        //         } else {
        //             console.warn('Erro ao completar transação. Voltando ao ponto anterior.', error) 
        //         }
                
        //         // return reject(false)
        //     })
        // });

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