let ipcRenderer = require('electron').ipcRenderer;

const w3 = require('../../plugins/w3/w3')

const SessaoRepositorio = require('../SessaoRepositorio')
const repositorio = new SessaoRepositorio()

const modalNew = require('../modal-de-marcacao/modal-de-marcacao');
const DateHelper = require('../../plugins/date/DateHelper');

let ipc = require('electron').ipcRenderer;

/**
 * Seletor que identifica a tabela de listagem de dados desse contexto
 */
const NOME_TABELA_HTML = 'tabela-lista-sessoes'

/**
 * Seletor que identifica o elemento com o título da página
 */
const ID_TITULO_DA_PAGINA = '#titulo-nome-paciente'

/**
 * Mensagens de feedback
 */
const MENSAGENS = {
    zero_registros: 'Esse paciente não possui nenhuma sessão marcada.',
    notas_vazias: 'Nada consta.',
    sucesso_gravacao: 'Sessão gravado com sucesso!',
    sucesso_remocao: 'Sessão desmarcada com sucesso!',
    erro_generico: 'Houve um erro ao realizar a operação. Tente novamente.',
}

/**
 * Carrega na tela os dados cadastrados na tabela
 * @return {undefined}
 */
async function inicializar() {
  w3.includeHTML(async () => {
    const paciente = JSON.parse(sessionStorage.getItem('dados_enviados_do_paciente'))
    let registros = await repositorio.todasComPaciente('sessao.data_hora_inicio DESC', paciente.id_paciente)
    document.querySelector(`[name="${NOME_TABELA_HTML}"] tbody`).innerHTML = montarHtmlTabela(registros)
    document.querySelector(ID_TITULO_DA_PAGINA).innerText = paciente.nome_paciente

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
        const possuiDescricao = registro.descricao !== null
        // Cada campo possui seu dataset
        const datasets = `data-id="${registro.id}"
            data-id_paciente="${registro.id_paciente}"
            data-nome_paciente="${registro.nome_paciente}"
            data-descricao="${registro.descricao || ''}"
            data-data_hora_inicio="${registro.data_hora_inicio}"
            data-data_hora_fim="${registro.data_hora_fim}"
            data-data_cadastro="${registro.data_cadastro}"
            data-status="${registro.status}"`
        
        let actions = `<a href="" class="link-warning" title="Ver ou editar os dados da sessão" name="edit">Ver/Editar</a> |` 
        actions += ` <a href="" class="link-danger" title="Desmarcar a sessão" name="delete">Desmarcar</a>`

        const dataHoraInicio = new DateHelper(registro.data_hora_inicio)
        const dataHoraFim = new DateHelper(registro.data_hora_fim)

        tableHtml += `<tr>
            <td>${dataHoraInicio.dateBR}</td>
            <td>${dataHoraInicio.time}</td>
            <td>${dataHoraFim.time}</td>
            <td class="${possuiDescricao ? '' : 'secondary-text'} lista-de-sessoes__notas">
              ${possuiDescricao ? registro.descricao : MENSAGENS.notas_vazias}
            </td>
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
        remove[i].addEventListener('click', deleteItem)
    }
}

/**
 * Preenche os dados do paciente ao clicar em editar
 * @param {object} eventoBotaoEditar 
 */
const selecionaItem = (eventoBotaoEditar) => {
  eventoBotaoEditar.preventDefault()

  const dataset = eventoBotaoEditar.currentTarget.parentNode.dataset

  const dataHoraInicio = new DateHelper(dataset.data_hora_inicio)
  const dataHoraFim = new DateHelper(dataset.data_hora_fim)
  const dataHora = {
    data_inicio: dataHoraInicio.date,
    hora_inicio: dataHoraInicio.time,
    data_fim: dataHoraInicio.date,
    hora_fim: dataHoraFim.time,
  }

  let campos = {
    ...dataset,
    ...dataHora,
  }

  modalNew.preencherCampos(campos)
  modalNew.openModal()
}

/**
 * Remove o registro e envia uma mensagem
 * @param {object} removeButtonEvent Evento do botão delete que contem o data attribute "id"
 * @return {undefined}
 */
const deleteItem = async (removeButtonEvent) => {
  removeButtonEvent.preventDefault()

  const wasRemoved = await repositorio.delete(removeButtonEvent.currentTarget.parentNode.dataset.id)
  let message = MENSAGENS.sucesso_remocao
  
  if (!wasRemoved) {
      message = MENSAGENS.erro_generico
      alert(message)
      return
  }

  alert(message)

  inicializar()
}

ipcRenderer.on('dados_enviados_do_paciente', (evento, dados) => {
  // Ações
  sessionStorage.setItem('dados_enviados_do_paciente', JSON.stringify(dados))
  inicializar()
})