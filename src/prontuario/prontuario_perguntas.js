const RoteiroDeAnamneseRepositorio = require('../roteiro_de_anamnese/RoteiroDeAnamneseRepositorio')
const perguntasRepositorio = new RoteiroDeAnamneseRepositorio()

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
    zero_registros_perguntas: 'Nenhuma pergunta encontrada',
}


async function recuperarPerguntasAnamnese() {
    let registros = await perguntasRepositorio.index()
    document.querySelector(ID_FORMULARIO_ANAMNESE_HTML_PERGUNTAS).innerHTML = montarFormularioDePerguntas(registros)
}

/**
 * Monta o html interativo do formulário de perguntas
 * @param {object} registros Registros retornados do banco
 * @returns {string} html do <tbody> da tabela
 */
 function montarFormularioDePerguntas(registros) {
    let formHtml = ''
    if (!registros.length) {
        formHtml = `<p>${MENSAGENS.zero_registros_perguntas}</p>`
        document.querySelector(ID_FORMULARIO_ANAMNESE_HTML_PERGUNTAS).innerHTML = formHtml
        return formHtml
    }

    registros.forEach((registro) => {
        // Cada campo possui seu dataset
        const datasets = `
            data-id="${registro.id}"
            data-id_roteiro="${registro.id}" 
            data-id_paciente=""`

        formHtml += `
            <label for="roteiro-${registro.id}"">
                ${registro.pergunta}
            </label>
            <textarea name="resposta" id="" class="u-full-width" ${datasets} ></textarea>`
    })

    return formHtml
}

module.exports = {
    ID_FORMULARIO_ANAMNESE_HTML,
    recuperarPerguntasAnamnese
}