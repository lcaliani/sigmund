const ProntuarioRepositorio = new  (require('../prontuario/ProntuarioRepositorio'))
const RespostasAnamneseRepositorio = new (require('../prontuario/respostas_anamnese/RespostasAnamneseRepositorio'))
const SessaoRepositorio = new (require('../sessoes/SessaoRepositorio'))

const DateHelper = require('../plugins/date/DateHelper')

const GeradorDePdf = require('./geradorDePdf')

/**
* Seletor que identifica o formulário de manipulação de dados desse contexto
*/
const ID_FORMULARIO_HTML = '#formulario-busca'

const NOME_TABELA_HTML = 'tabela-lista-sessoes'

/** Botão de geração do relatório, exibido após retornar resultados */
const BOTAO_GERAR_RELATORIO = "#botao-gerar-relatorio"

/** Botão de limpeza dos dados do relatório, exibido após retornar resultados */
const BOTAO_LIMPAR_BUSCA = "#botao-limpar-busca"

const CHECK_INCLUIR_SESSAO = '[name="incluir-no-relatorio"]:checked'

/**
 * Campos do formulário
 */
const FORMULARIO = {
  ID_PACIENTE: `${ID_FORMULARIO_HTML} select[name="id_paciente"]`,
  DATA_HORA_INICIO: `${ID_FORMULARIO_HTML} input[name="data_hora_inicio"]`,
  DATA_HORA_FIM: `${ID_FORMULARIO_HTML} input[name="data_hora_fim"]`,
  TODAS_SESSOES_CHECK : `${ID_FORMULARIO_HTML}[name="todas_as_sessoes"]`
}

/**
* Mensagens de feedback
*/
const MENSAGENS = {
    zero_registros: 'Nenhum registro encontrado',
    erro_generico: 'Houve um erro ao realizar a operação. Tente novamente.',
    notas_vazias: 'Nada consta.',
    nenhuma_sessao_escolhida: 'É necessário marcar ao menos um registro para gerar o relatório',
}

/**
 * Carrega na tela os dados cadastrados na tabela
 * @return {undefined}
 */
const inicializar = async () => {
    document.querySelector(`${ID_FORMULARIO_HTML} select[name="id_paciente"]`).innerHTML = await montarSelectHtml()
    vincularAcoes()
}

/**
 * Busca e retorna o html da lista dos pacientes no select de pacientes para relatorio
 * @returns {Promise<string>} HTML com os <option> do <select>, montados a partir do banco
 */
const montarSelectHtml = async () => {
  const pacientes = await ProntuarioRepositorio.index('nome')
  if (pacientes.length === 0) {
    return '<option value="" disabled selected>Não foram encontrados pacientes ativos</option>'
  }

  let listaDePacientesHtml = ''
  pacientes.forEach((paciente) => {
    listaDePacientesHtml += `<option value="${paciente.id}">${paciente.nome}</option>`
  })

  return listaDePacientesHtml
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
        data-data_hora_inicio="${registro.data_hora_inicio}"
        data-data_hora_fim="${registro.data_hora_fim}"
        data-id_paciente="${registro.id_paciente}"
      `

      const dataHoraInicio = new DateHelper(registro.data_hora_inicio)
      const dataHoraFim = new DateHelper(registro.data_hora_fim)

      const possuiDescricao = registro.descricao !== null
      const descricao = possuiDescricao ? registro.descricao : MENSAGENS.notas_vazias

      tableHtml += `<tr>
          <td>${dataHoraInicio.dateBR} às <strong>${dataHoraInicio.time}</strong></td>
          <td>${dataHoraFim.dateBR} às <strong>${dataHoraFim.time}</strong></td>
          <td>
            <div class="table-column-text
            ${possuiDescricao 
              ? 'table-column-long-text'
              : 'secondary-text'
            }" 
            title="${descricao}">
              ${descricao}
            </div>
          </td>
          <td>
            <input type="checkbox" name="incluir-no-relatorio" ${datasets}>
          </td>
      </tr>`
  })

  return tableHtml
}

/**
 * Vincula as ações dos botões na tela
 */
const vincularAcoes = () => {
  // Buscar dados
  document.querySelector(ID_FORMULARIO_HTML).addEventListener('submit', buscar)

  // Limpeza dos inputs ao cancelar edição
  document.querySelector(`${ID_FORMULARIO_HTML} .cancel-edit`)
    .addEventListener('click', limparCampos)

  // Limpar dados da busca na tabela
  document.querySelector(BOTAO_LIMPAR_BUSCA).addEventListener('click', limparBusca)

  // Gerar relatório ao clicar no botão
  document.querySelector(BOTAO_GERAR_RELATORIO)
    .addEventListener('click', gerarRelatorio)
}

/**
 * Limpa os campos do formulário, voltando ao estado inicial
 */
const limparCampos = (event) => {
  if (event !== undefined) {
    event.preventDefault();
  }

  document.querySelector(ID_FORMULARIO_HTML).reset()
  document.querySelector(`${ID_FORMULARIO_HTML} input[name="status"]`).value = 1
}

/**
 * Busca e disponibiliza os dados do paciente, baseado nos valores informados no formulário
 * @param {Event} event 
 */
const buscar = async (event) => {
  event.preventDefault()
  const idPaciente = document.querySelector(`${FORMULARIO.ID_PACIENTE}`).value
  const dataHoraInicio = `${document.querySelector(`${FORMULARIO.DATA_HORA_INICIO}`).value} 00:00`
  const dataHoraFim = `${document.querySelector(`${FORMULARIO.DATA_HORA_FIM}`).value} 23:59`
  // const todasAsSessoes = document.querySelector(`${FORMULARIO.TODAS_SESSOES_CHECK}`).value

  let registros = await SessaoRepositorio.todasComPaciente(
    'data_hora_inicio',
    idPaciente, 
    dataHoraInicio,
    dataHoraFim
  )
  document.querySelector(`[name="${NOME_TABELA_HTML}"] tbody`).innerHTML = montarHtmlTabela(registros)
  
  // Disponibiliza botões para gerar o relatório
  if (registros.length > 0) {
    document.querySelector(BOTAO_GERAR_RELATORIO).classList.remove('d-none')
    document.querySelector(BOTAO_LIMPAR_BUSCA).classList.remove('d-none')
  }
}

/**
 * Limpa os resultados da busca
 * @param {Event} event
 * @return {undefined}
 */
const limparBusca = (event) => {
  if (event !== undefined) {
    event.preventDefault();
  }

  document.querySelector(`[name="${NOME_TABELA_HTML}"] tbody`).innerHTML = ''
  document.querySelector(BOTAO_GERAR_RELATORIO).classList.add('d-none')
  document.querySelector(BOTAO_LIMPAR_BUSCA).classList.add('d-none')
}

/**
 * Reune os dados de geracao de relatorio e gera o relatorio
 * @param {Event} event 
 * @returns 
 */
const gerarRelatorio = async (event) => {
  if (event !== undefined) {
    event.preventDefault();
  }

  const sessoesEscolhidasElements = document.querySelectorAll(CHECK_INCLUIR_SESSAO)

  if (sessoesEscolhidasElements.length === 0) {
    alert(MENSAGENS.nenhuma_sessao_escolhida)
    return
  }

  let sessoesEscolhidasIds = []
  sessoesEscolhidasElements.forEach((sessao) => {
    sessoesEscolhidasIds.push(sessao.dataset.id)
  })

  const idPaciente = sessoesEscolhidasElements[0].dataset.id_paciente

  const dadosPaciente = await ProntuarioRepositorio.find(idPaciente)
  const respostasAnamnese = await RespostasAnamneseRepositorio.buscarRespostasPorIdDoPaciente(idPaciente)
  const dadosSessoes = await SessaoRepositorio
    .findAllByIds(sessoesEscolhidasIds, 'data_hora_inicio')

}

// Inicialização
window.addEventListener('DOMContentLoaded', () => {
  inicializar()
})
