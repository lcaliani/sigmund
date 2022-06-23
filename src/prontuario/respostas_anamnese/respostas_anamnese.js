const RoteiroDeAnamneseRepositorio = require('../../roteiro_de_anamnese/RoteiroDeAnamneseRepositorio')
const perguntasRepositorio = new RoteiroDeAnamneseRepositorio()

const RespostasDeAnamneseRepositorio = require('./RespostasAnamneseRepositorio')
const respostasRepositorio = new RespostasDeAnamneseRepositorio()

/**
 * Seletor que identifica o formulário de anamnese
 */
const ID_FORMULARIO_ANAMNESE_HTML = '#formulario-dados-do-paciente-anamnese'

/**
 * Seletor que identifica a div de perguntas dentro formulário de anamnese
 */
const ID_FORMULARIO_ANAMNESE_HTML_PERGUNTAS = `${ID_FORMULARIO_ANAMNESE_HTML} #formulario-dados-do-paciente-anamnese-perguntas`

/**
 * Mensagens de feedback
 */
const MENSAGENS = {
    zero_registros_perguntas: 'Nenhuma pergunta encontrada.',
    sucesso_gravacao: 'Respostas registradas com sucesso!',
    erro_generico: 'Houve um erro ao realizar a operação. Tente novamente.',
}

let actionsAlreadyBinded = false;

/**
 * Carregamento inicial do formulário de perguntas
 */
async function inicializar() {
    let registros = await perguntasRepositorio.index()
    document.querySelector(ID_FORMULARIO_ANAMNESE_HTML_PERGUNTAS).innerHTML = montarFormularioDePerguntas(registros)

    vincularAcoes()
}

/**
 * Monta o html interativo do formulário de perguntas
 * @param {object} registros Registros retornados do banco
 * @returns {string} html do <tbody> da tabela
 */
 function montarFormularioDePerguntas(registros) {
    document.querySelector(ID_FORMULARIO_ANAMNESE_HTML_PERGUNTAS).dataset.id_paciente 
    let formHtml = ''
    if (!registros.length) {
        formHtml = `<p>${MENSAGENS.zero_registros_perguntas}</p>`
        document.querySelector(ID_FORMULARIO_ANAMNESE_HTML_PERGUNTAS).innerHTML = formHtml
        return formHtml
    }

    registros.forEach((registro) => {
        // Cada campo possui seu dataset
        const datasets = `
            data-id_resposta=""
            data-id_roteiro="${registro.id}",
            data-id_paciente=""`

        formHtml += `
            <label for="roteiro-${registro.id}"">
                ${registro.pergunta}
            </label>
            <textarea name="roteiro-${registro.id}"  class="u-full-width" ${datasets} ></textarea>`
    })

    return formHtml
}

/**
 * Recupera e organiza os dados do formulário de perguntas de anamnese, usado ao salvar os dados
 * @returns {array<object>} Lista de objetos com as infos. das respostas
 */
function prepararDadosDoFormulario() {
    let inputs = Array.from(document.querySelectorAll(`${ID_FORMULARIO_ANAMNESE_HTML} textarea`))

    let respostas = []
    inputs.forEach((input) => {
        let resposta = {
            id: input.dataset.id_resposta || null, // Se nova = null, se já existente, vem o id
            id_roteiro: input.dataset.id_roteiro,
            id_paciente: input.dataset.id_paciente || null,
            resposta: input.value || ''
        }

        respostas.push(resposta)
    })
    return respostas
}

/**
 * Preenche os inputs com os valores recebidos do banco
 * @param {object} memberValues 
 * @return {undefined}
 */
async function preencherCampos(idPaciente) {
    document.querySelector(ID_FORMULARIO_ANAMNESE_HTML).dataset.id_paciente = idPaciente

    let registros = await respostasRepositorio.buscarRespostasPorIdDoPaciente(idPaciente)
    registros.forEach((resposta) => {
        const campoDeResposta = `${ID_FORMULARIO_ANAMNESE_HTML} textarea[data-id_roteiro="${resposta.id_roteiro}"]`
            document.querySelector(campoDeResposta).value = resposta.resposta || ''
            document.querySelector(campoDeResposta).dataset.id_paciente = idPaciente
            document.querySelector(campoDeResposta).dataset.id_resposta = resposta.id
    })

    document.querySelector(`${ID_FORMULARIO_ANAMNESE_HTML} button`).removeAttribute('disabled')
}

/**
 * Limpa os inputs e oculta o botão de "cancelar edição"
 * @param {Event}
 */
function limparCampos(event) {
    if (event !== undefined) {
        event.preventDefault();
    }

    // dados do paciente
    document.querySelectorAll(`${ID_FORMULARIO_ANAMNESE_HTML} textarea`).forEach((textArea) => {
        textArea.dataset.id_resposta = ''
        textArea.dataset.id_paciente = ''
        textArea.value = ''
    })
}

/**
 * Vincula o envio do formulario ao método save, para persistir os dados
 */
function vincularAcoes() {
    if (actionsAlreadyBinded) {
        return;
    }
    document.querySelector(`${ID_FORMULARIO_ANAMNESE_HTML}`).addEventListener('submit', save)
}
/**
 * Grava os dados do prontuario
 * @param {object} event Evento de submit do form
 * @return {undefined}
 */
async function save(event) {
    event.preventDefault()
    const dadosDoFormulario = prepararDadosDoFormulario() // id pergunta, resposta,
    
    const idPaciente = document.querySelector(ID_FORMULARIO_ANAMNESE_HTML).dataset.id_paciente
    const wasSaved = await respostasRepositorio.saveOrUpdate(dadosDoFormulario, idPaciente)
    let message = MENSAGENS.sucesso_gravacao
    
    if (!wasSaved) {
        message = MENSAGENS.erro_generico
        console.warn(message)
        return
    }

    console.log(message)

    inicializar()
    limparCampos()
}

module.exports = {
    ID_FORMULARIO_ANAMNESE_HTML,
    inicializar,
    prepararDadosDoFormulario,
    preencherCampos,
    limparCampos,
}