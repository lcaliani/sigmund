const RoteiroDeAnamneseRepositorio = require('./RoteiroDeAnamneseRepositorio')
const repositorio = new RoteiroDeAnamneseRepositorio()

/**
 * Seletor que identifica a tabela de listagem de dados desse contexto
 */
const NOME_TABELA_HTML = 'tabela-roteiro-de-anamnese'

/**
 * Seletor que identifica o formulário de manipulação de dados desse contexto
 */
const ID_FORMULARIO_HTML = '#formulario-roteiro-de-anamnese'

console.log(document.querySelector('#formulario-roteiro-de-anamnese'))

/**
 * Mensagens de feedback
 */
const MENSAGENS = {
    zero_registros: 'Nenhum registro encontrado',
    sucesso_gravacao: 'Pergunta gravada com sucesso!',
    sucesso_remocao: 'Pergunta inativada com sucesso!',
    erro_generico: 'Houve um erro ao realizar a operação. Tente novamente.'
}

/**
 * Carrega os membros cadastrados na tabela na tela
 * @return {undefined}
 */
async function inicializar() {
    let tableHtml = ''
    let registros = await repositorio.index()

    if (!registros.length) {
        tableHtml = `<tr><td colspan="6">${MENSAGENS.zero_registros}</td></tr>`
        document.querySelector(`[name="${NOME_TABELA_HTML}"] tbody`).innerHTML = tableHtml
        return
    }

    registros.forEach((registro) => {
        const datasets = `data-id="${registro.id}" data-pergunta="${registro.pergunta}" data-status="${registro.status}"`
        
        let actions = `<a href="" class="link-warning" name="edit">Editar</a> |` 
        actions += `<a href="" class="link-danger" name="delete">Excluir</a>`

        tableHtml += `<tr>
            <td>${registro.pergunta}</td>
            <td ${datasets}>${actions}</td>
        </tr>`
    })

    document.querySelector(`[name="${NOME_TABELA_HTML}"] tbody`).innerHTML = tableHtml

    vincularAcoes()
}

/**
 * Recupera os valores dos inputs do associado no formato {input-name: value}
 * @return {object}
 */
 function recuperarDadosDoFormulario() {
    let inputs = Array.from(document.querySelectorAll(`${ID_FORMULARIO_HTML} input`))
        
    return inputs.reduce((accumulator, input) =>
        ({ ...accumulator, [input.name]: input.value || null}), {}
    )
}

/**
 * Associa as ações de atualização e remoção de associados aos respectivos botões
 * @return {undefined}
 */
function vincularAcoes() {
    let edit = document.querySelectorAll(`[name="${NOME_TABELA_HTML}"] [name="edit"]`)
    let remove = document.querySelectorAll(`[name="${NOME_TABELA_HTML}"] [name="delete"]`)
    
    const counter = edit.length

    for (let i = 0; i < counter; i++) {
        edit[i].addEventListener('click', (e) => {
            e.preventDefault()
            preencherCampos(e.currentTarget.parentNode.dataset)
        })
        remove[i].addEventListener('click', deleteItem)
    }

    /**
     * Gravação 
     */
    document.querySelector(`${ID_FORMULARIO_HTML}`).addEventListener('submit', save)

    /**
     * Limpeza dos inputs ao cancelar edição
     */
    document.querySelector(`${ID_FORMULARIO_HTML} .cancel-edit`).addEventListener('click', limparCampos)
}

/**
 * Preenche os inputs com os valores recebidos
 * @param {object} memberValues 
 * @return {undefined}
 */
function preencherCampos(roteiroValores = {}) {
    let valoresFormatados = {}
    for (let [chave, valor] of Object.entries(roteiroValores)) {
        valoresFormatados[chave] = (valor == 'null' || !valor) ? '' : valor;
    }
    
    const {id, pergunta, status} = valoresFormatados

    document.querySelector(`${ID_FORMULARIO_HTML} input[name="id"]`).value = id
    document.querySelector(`${ID_FORMULARIO_HTML} input[name="pergunta"]`).value = pergunta
    document.querySelector(`${ID_FORMULARIO_HTML} input[name="status"]`).value = status

    document.querySelector(`${ID_FORMULARIO_HTML} .edit-status`).classList.remove('d-none')
    document.querySelector(`${ID_FORMULARIO_HTML} .cancel-edit`).classList.remove('d-none')
}

/**
 * Grava os dados do associado
 * @param {object} event Evento de submit do form
 * @return {undefined}
 */
async function save(event) {
    event.preventDefault()
    const informacoesDoRoteiro = recuperarDadosDoFormulario()
    console.log(informacoesDoRoteiro)
    const isUpdating = informacoesDoRoteiro.id !== null
    const wasSaved = isUpdating 
        ? await repositorio.update(informacoesDoRoteiro)
        : await repositorio.insert(informacoesDoRoteiro)

    let message = MENSAGENS.sucesso_gravacao
    
    if (!wasSaved) {
        message = MENSAGENS.erro_generico
        alert(message)
        return
    }

    inicializar()
    limparCampos()
    alert(message)
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

    inicializar()
    alert(message)
}

/**
 * Limpa os inputs e oculta o botão de "cancelar edição"
 */
function limparCampos(event) {

    if (event !== undefined) {
        event.preventDefault();
    }
    document.querySelector(`${ID_FORMULARIO_HTML} input[name="pergunta"]`).value = ''
    document.querySelector(`${ID_FORMULARIO_HTML} input[name="id"]`).value = ''
    document.querySelector(`${ID_FORMULARIO_HTML} input[name="status"]`).value = '1' // default 1
    document.querySelector(`${ID_FORMULARIO_HTML} .cancel-edit`).classList.add('d-none')
    document.querySelector(`${ID_FORMULARIO_HTML} .edit-status`).classList.add('d-none')
}

inicializar()




