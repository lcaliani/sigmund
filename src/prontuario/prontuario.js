const prontuarioPerguntas = require('./respostas_anamnese/respostas_anamnese')

const ProntuarioRepositorio = require('./ProntuarioRepositorio')
const repositorio = new ProntuarioRepositorio()

let ipc = require('electron').ipcRenderer;

/**
 * Seletor que identifica a tabela de listagem de dados desse contexto
 */
const NOME_TABELA_HTML = 'tabela-prontuario'

/**
 * Seletor que identifica o formulário de manipulação de dados desse contexto
 */
const ID_FORMULARIO_HTML = '#formulario-dados-do-paciente'

/**
 * Mensagens de feedback
 */
const MENSAGENS = {
    zero_registros: 'Nenhum registro encontrado',
    sucesso_gravacao: 'Dados registrados com sucesso!',
    sucesso_remocao: 'Paciente inativado com sucesso!',
    erro_generico: 'Houve um erro ao realizar a operação. Tente novamente.',
}

let actionsAlreadyBinded = false;

/**
 * Carrega na tela os dados cadastrados na tabela
 * @return {undefined}
 */
async function inicializar() {
    let registros = await repositorio.index()
    document.querySelector(`[name="${NOME_TABELA_HTML}"] tbody`).innerHTML = montarHtmlTabela(registros)

    await prontuarioPerguntas.inicializar()

    vincularAcoes()
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
            data-nome="${registro.nome}"
            data-nome_pai="${registro.nome_pai}"
            data-nome_mae="${registro.nome_mae}"
            data-data_nascimento="${registro.data_nascimento}"
            data-cidade="${registro.cidade}"
            data-endereco="${registro.endereco}"
            data-status="${registro.status}"`
        
        let actions = `<a href="" class="link-warning" name="edit">Ver/Editar</a> |` 
        actions += ` <a href="" class="link-danger" name="delete">Excluir</a> |` 
        actions += ` <a href="" class="link-info" name="ver-sessoes">Sessões</a>`

        tableHtml += `<tr>
            <td>${registro.nome}</td>
 
            <td ${datasets}>${actions}</td>
        </tr>`
    })

    return tableHtml
}

/**
 * Recupera os valores dos inputs do prontuario no formato {input-name: value}
 * @return {object}
 */
 function recuperarDadosDoFormulario() {
    let inputs = Array.from(document.querySelectorAll(`${ID_FORMULARIO_HTML} input`))
        
    return inputs.reduce((accumulator, input) =>
        ({ ...accumulator, [input.name]: input.value || null}), {}
    )
}

/**
 * Associa as ações de atualização e remoção de prontuarios aos respectivos botões
 * @return {undefined}
 */
function vincularAcoes() {
    let edit = document.querySelectorAll(`[name="${NOME_TABELA_HTML}"] [name="edit"]`)
    let remove = document.querySelectorAll(`[name="${NOME_TABELA_HTML}"] [name="delete"]`)
    let verSessoes = document.querySelectorAll(`[name="${NOME_TABELA_HTML}"] [name="ver-sessoes"]`)
    
    const counter = edit.length

    for (let i = 0; i < counter; i++) {
        edit[i].addEventListener('click', selecionaItem)
        remove[i].addEventListener('click', deleteItem)
        verSessoes[i].addEventListener('click', abreTelaDeListaDeSessoes)
    }

    if (actionsAlreadyBinded) {
        return;
    }

    /**
     * Gravação - botão que dispara o evento
     */
    document.querySelector(`#save`).addEventListener('click', () => {
        document.querySelector(`${ID_FORMULARIO_HTML} input[type="submit"]`).click()
    })

    /**
     * Gravação - evento
     */
    document.querySelector(`${ID_FORMULARIO_HTML}`).addEventListener('submit', save)

    /**
     * Limpeza dos inputs ao cancelar edição
     */
    document.querySelector(`.footer .cancel-edit`).addEventListener('click', limparCampos)

    /**
     * Visibilidade dos inputs de roteiro de anamnese
     */
    document.querySelector(`${ID_FORMULARIO_HTML} [name="exibir_roteiro_de_anamnese"]`)
        .addEventListener('change', alternarVisibilidadeAnamnese)
    
    actionsAlreadyBinded = true
}

/**
 * Preenche os inputs com os valores recebidos
 * @param {object} memberValues 
 * @param {object} linhaDaTabela Elemento html representando a <tr> onde fica a ação clicada
 * @return {undefined}
 */
function preencherCampos(valoresDoBanco = {}, linhaDaTabela) {
    let valoresFormatados = {}
    for (let [chave, valor] of Object.entries(valoresDoBanco)) {
        valoresFormatados[chave] = (valor == 'null' || !valor) ? '' : valor;
    }

    const {id, nome, nome_pai, nome_mae, data_nascimento, cidade, endereco, status} = valoresFormatados

    // Campos dos dados
    document.querySelector(`${ID_FORMULARIO_HTML} input[name="id"]`).value = id
    document.querySelector(`${ID_FORMULARIO_HTML} input[name="nome"]`).value = nome
    document.querySelector(`${ID_FORMULARIO_HTML} input[name="nome_pai"]`).value = nome_pai
    document.querySelector(`${ID_FORMULARIO_HTML} input[name="nome_mae"]`).value = nome_mae
    document.querySelector(`${ID_FORMULARIO_HTML} input[name="data_nascimento"]`).value = data_nascimento
    document.querySelector(`${ID_FORMULARIO_HTML} input[name="cidade"]`).value = cidade
    document.querySelector(`${ID_FORMULARIO_HTML} input[name="endereco"]`).value = endereco
    document.querySelector(`${ID_FORMULARIO_HTML} input[name="status"]`).value = status

    // Botões padrão
    document.querySelector(`${ID_FORMULARIO_HTML} .edit-status`).classList.remove('d-none')
    document.querySelector(`.footer .cancel-edit`).classList.remove('d-none')

    // Badge de edição
    document.querySelector('#paciente-atual-sendo-editado').innerHTML = nome

    // Seleção na tabela
    linhaDaTabela.classList.add('row-selected')

    prontuarioPerguntas.preencherCampos(id)
}

/**
 * Grava os dados do prontuario
 * @param {object} event Evento de submit do form
 * @return {undefined}
 */
async function save(event) {
    event.preventDefault()
    const dadosDoFormulario = recuperarDadosDoFormulario()
    
    const isUpdating = dadosDoFormulario.id !== null
    const wasSaved = isUpdating 
        ? await repositorio.update(dadosDoFormulario)
        : await repositorio.insert(dadosDoFormulario)

    let message = MENSAGENS.sucesso_gravacao
    
    if (!wasSaved) {
        message = MENSAGENS.erro_generico
        alert(message)
        return
    }

    /**
     * No update, o id vem do formulário do paciente
     * No insert, o id vem do resultado da query de insert
     */
    const patientId = isUpdating ? dadosDoFormulario.id : wasSaved

    // Setar no formulário de perguntas o id do paciente manipulado/criado
    document.querySelector('#formulario-dados-do-paciente-anamnese').dataset.id_paciente = patientId
    document.querySelectorAll(`#formulario-dados-do-paciente-anamnese textarea`).forEach((textarea) => {
        textarea.dataset.id_paciente = patientId
    })
    
    alert(message)

    // invoca respostas_anamnese.save()
    document.querySelector(`${prontuarioPerguntas.ID_FORMULARIO_ANAMNESE_HTML}`)
        .dispatchEvent(new Event('submit'));

    inicializar()
    limparCampos()
}

/**
 * Remove o registro e envia uma mensagem
 * @param {object} removeButtonEvent Evento do botão delete que contem o data attribute "id"
 * @return {undefined}
 */
async function deleteItem(removeButtonEvent) {
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
    limparCampos()
}

/**
 * Preenche os dados do paciente ao clicar em editar
 * @param {object} eventoBotaoEditar 
 */
function selecionaItem(eventoBotaoEditar) {
    eventoBotaoEditar.preventDefault()

    limparCampos()

    preencherCampos(
        eventoBotaoEditar.currentTarget.parentNode.dataset,
        eventoBotaoEditar.currentTarget.parentNode.parentNode
    )
}

function abreTelaDeListaDeSessoes(eventoBotaoSessoes) {
    eventoBotaoSessoes.preventDefault()

    const dados = eventoBotaoSessoes.currentTarget.parentNode.dataset
    ipc.send(
        'abrir_janela_lista_de_sessoes',
        {
          'dados': {
            id_paciente: dados.id,
            nome_paciente: dados.nome,
          }
        }
    )
}

/**
 * Limpa os inputs e oculta o botão de "cancelar edição"
 * 
 */
function limparCampos(event) {

    if (event !== undefined) {
        event.preventDefault();
    }

    // dados do paciente
    document.querySelector(`${ID_FORMULARIO_HTML} input[name="id"]`).value = ''
    document.querySelector(`${ID_FORMULARIO_HTML} input[name="nome"]`).value = ''
    document.querySelector(`${ID_FORMULARIO_HTML} input[name="nome_pai"]`).value = ''
    document.querySelector(`${ID_FORMULARIO_HTML} input[name="nome_mae"]`).value = ''
    document.querySelector(`${ID_FORMULARIO_HTML} input[name="data_nascimento"]`).value = ''
    document.querySelector(`${ID_FORMULARIO_HTML} input[name="cidade"]`).value = ''
    document.querySelector(`${ID_FORMULARIO_HTML} input[name="endereco"]`).value = ''
    document.querySelector(`${ID_FORMULARIO_HTML} input[name="status"]`).value = '1' // default 1

    // Botões padrão
    document.querySelector(`.footer .cancel-edit`).classList.add('d-none')
    document.querySelector(`${ID_FORMULARIO_HTML} .edit-status`).classList.add('d-none')

    // Seleção na tabela
    document.querySelectorAll('tr').forEach((linhaDaTabela) => {
        linhaDaTabela.classList.remove('row-selected')
    })

    // Resposta
    prontuarioPerguntas.limparCampos(event)
}

/**
 * Alterna a visibilidade do formulário de anamnese baseado no checkbox
 * @param {Event} event 
 */
function alternarVisibilidadeAnamnese(event) {

    document.querySelector(prontuarioPerguntas.ID_FORMULARIO_ANAMNESE_HTML).classList
        .toggle('d-none', event.currentTarget.checked == false)
}

// Ações
inicializar()
