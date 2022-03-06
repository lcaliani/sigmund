let ipcRenderer = require('electron').ipcRenderer;

const w3 = require('../../plugins/w3/w3')

const SessaoRepositorio = require('../SessaoRepositorio')
const repositorio = new SessaoRepositorio()

const modalNew = require('../modal-de-marcacao/modal-de-marcacao')

let ipc = require('electron').ipcRenderer;

/**
 * Seletor que identifica a tabela de listagem de dados desse contexto
 */
const NOME_TABELA_HTML = 'tabela-lista-sessoes'

/**
 * Seletor que identifica o formulário de manipulação de dados desse contexto
 */
const ID_FORMULARIO_HTML = '#formulario-dados-do-paciente'

/**
 * Mensagens de feedback
 */
const MENSAGENS = {
    zero_registros: 'Esse paciente não possui nenhuma sessão marcada.',
    sucesso_gravacao: 'Sessão gravado com sucesso!',
    sucesso_remocao: 'Sessão desmarcada com sucesso!',
    erro_generico: 'Houve um erro ao realizar a operação. Tente novamente.',
}

/**
 * Carrega na tela os dados cadastrados na tabela
 * @return {undefined}
 */
async function inicializar(paciente_id) {
  w3.includeHTML(async () => {
    let registros = await repositorio.todasComPaciente('sessao.data_hora_inicio DESC', paciente_id)
    document.querySelector(`[name="${NOME_TABELA_HTML}"] tbody`).innerHTML = montarHtmlTabela(registros)

    vincularAcoes()


    modalNew.inicializar()

    // Comunicação através de eventos com o plugin de modal
    // Após salvar ou desmarcar, reinicializa o calendário atualizado
    document.addEventListener('salvar_sessao', inicializar)
    document.addEventListener('desmarcar_sessao', inicializar)
  })
}

/**
 * Monta o html interativo da tabela de listagem de registros
 * @param {object} registros Registros retornados do banco
 * @returns {string} html do <tbody> da tabela
 */
function montarHtmlTabela(registros) {
    let tableHtml = ''
    if (!registros.length) {
        tableHtml = `<tr><td colspan="6">${MENSAGENS.zero_registros}</td></tr>`
        document.querySelector(`[name="${NOME_TABELA_HTML}"] tbody`).innerHTML = tableHtml
        return tableHtml
    }

    registros.forEach((registro) => {
        // Cada campo possui seu dataset
        const datasets = `data-id="${registro.id}"
            data-id_paciente="${registro.id_paciente}"
            data-nome_paciente="${registro.nome_paciente}"
            data-descricao="${registro.descricao}"
            data-data_hora_inicio="${registro.data_hora_inicio}"
            data-data_hora_fim="${registro.data_hora_fim}"
            data-data_cadastro="${registro.data_cadastro}"
            data-status="${registro.status}"`
        
        let actions = `<a href="" class="link-warning" name="edit">Ver/Editar</a> |` 
        actions += ` <a href="" class="link-danger" name="delete">Desmarcar</a> |` 

        tableHtml += `<tr>
            <td>${registro.data_hora_inicio}</td>
            <td>${registro.data_hora_fim}</td>
            <td>${registro.descricao}</td>
            <td ${datasets}>${actions}</td>
        </tr>`
    })

    return tableHtml
}

/**
 * Associa as ações de atualização e remoção de prontuarios aos respectivos botões
 * @return {undefined}
 */
function vincularAcoes() {
    let edit = document.querySelectorAll(`[name="${NOME_TABELA_HTML}"] [name="edit"]`)
    let remove = document.querySelectorAll(`[name="${NOME_TABELA_HTML}"] [name="delete"]`)
    
    const counter = edit.length

    for (let i = 0; i < counter; i++) {
        edit[i].addEventListener('click', selecionaItem)
        // remove[i].addEventListener('click', deleteItem)
    }

}

/**
 * Preenche os dados do paciente ao clicar em editar
 * @param {object} eventoBotaoEditar 
 */
const selecionaItem = (eventoBotaoEditar) => {
  eventoBotaoEditar.preventDefault()

  console.log(eventoBotaoEditar.currentTarget.parentNode.dataset)
  // modalNew.preencherCampos(eventoBotaoEditar.currentTarget.parentNode.dataset)
  // modalNew.openModal()
}





ipcRenderer.on('dados_enviados_do_paciente', (evento, dados) => {
  // Ações
  inicializar(dados.id_paciente)
})