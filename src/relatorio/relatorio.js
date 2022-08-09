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

const CHECK_INCLUIR_SESSAO_MARCADA = '[name="incluir-no-relatorio"]:checked'

const CHECK_INCLUIR_SESSAO = '[name="incluir-no-relatorio"]'

const CHECK_MARCAR_TODAS = '[name="marcar_todas"]'

const COLUNA_NOTAS = '#coluna-notas'

/**
 * Campos do formulário
 */
const FORMULARIO = {
  ID_PACIENTE: `${ID_FORMULARIO_HTML} select[name="id_paciente"]`,
  DATA_HORA_INICIO: `${ID_FORMULARIO_HTML} input[name="data_hora_inicio"]`,
  DATA_HORA_FIM: `${ID_FORMULARIO_HTML} input[name="data_hora_fim"]`,
  TODAS_SESSOES_CHECK : `${ID_FORMULARIO_HTML} input[name="todas_as_sessoes"]`
}

/**
* Mensagens de feedback
*/
const MENSAGENS = {
    zero_registros: 'Nenhum registro encontrado',
    erro_generico: 'Houve um erro ao realizar a operação. Tente novamente.',
    notas_vazias: 'Nada consta.',
    nenhuma_sessao_escolhida: 'É necessário marcar ao menos um registro para gerar o relatório',
    nova_busca: 'Preencha os campos e clique em Buscar para realizar uma nova busca.',
    paciente_cadastro_incompleto: 'Há dados incompletos no cadastro do paciente. Verifique o cadastro para prosseguir.',
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

  tableHtml += `<tr>
    <td colspan="6" class="marcar_todas_container">
      <input type="checkbox" name="marcar_todas" class="">
      <small>
        <label for="marcar_todas" class="label-inline"> Marcar todas</label>
      </small>
    </td>
  </tr>`

  registros.forEach((registro) => {
      // Cada campo possui seu dataset
      const datasets = `data-id="${registro.id}"
        data-data_hora_inicio="${registro.data_hora_inicio}"
        data-data_hora_fim="${registro.data_hora_fim}"
        data-id_paciente="${registro.id_paciente}"`

      const dataHoraInicio = new DateHelper(registro.data_hora_inicio)
      const dataHoraFim = new DateHelper(registro.data_hora_fim)

      const possuiDescricao = registro.descricao !== null
      const descricao = possuiDescricao ? registro.descricao : MENSAGENS.notas_vazias
      const textColumnClass = possuiDescricao ? 'table-column-long-text-closed' : 'secondary-text'
      tableHtml += `<tr>
        <td>
          <input type="checkbox" name="incluir-no-relatorio" ${datasets}>
        </td>
        <td>${dataHoraInicio.dateBR} às <strong>${dataHoraInicio.time}</strong></td>
        <td>${dataHoraFim.dateBR} às <strong>${dataHoraFim.time}</strong></td>
        <td>
          <div id="coluna-notas"
            class="table-column-text ${textColumnClass}" 
            title="${descricao}">
              ${descricao}
          </div>
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
  document.querySelector(`${ID_FORMULARIO_HTML} .cancel-edit`).addEventListener('click', limparCampos)

  // Limpar dados da busca na tabela
  document.querySelector(BOTAO_LIMPAR_BUSCA).addEventListener('click', limparBusca)

  // Desabilitar datas de datas de sessões
  document.querySelector(FORMULARIO.TODAS_SESSOES_CHECK).addEventListener('change', desabilitarDatas)

  // Gerar relatório ao clicar no botão
  document.querySelector(BOTAO_GERAR_RELATORIO).addEventListener('click', gerarRelatorio)
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
  document.querySelectorAll(`${ID_FORMULARIO_HTML} input[type="date"]`)
    .forEach((data) => {
      data.disabled = false
    })
}

/**
 * Busca e disponibiliza os dados do paciente, baseado nos valores informados no formulário
 * @param {Event} event 
 */
const buscar = async (event) => {
  event.preventDefault()
  const idPaciente = document.querySelector(`${FORMULARIO.ID_PACIENTE}`).value
  let dataHoraInicio = null
  let dataHoraFim = null

  const buscarTodasAsSessoes = document.querySelector(FORMULARIO.TODAS_SESSOES_CHECK).checked
  if (!buscarTodasAsSessoes) {
    dataHoraInicio = `${document.querySelector(`${FORMULARIO.DATA_HORA_INICIO}`).value} 00:00`
    dataHoraFim = `${document.querySelector(`${FORMULARIO.DATA_HORA_FIM}`).value} 23:59`
  }

  const hasInvalidDates = new DateHelper(dataHoraFim).fullDate.getTime() < new DateHelper(dataHoraInicio).fullDate.getTime()
  if (hasInvalidDates) {
    alert('A data inicial deve ser de antes da data final. Por favor, revise as datas informadas.')
    return
  }

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
    
    // Exibir mais notas
    document.querySelectorAll(COLUNA_NOTAS).forEach((nota) => {
      nota.addEventListener('click', alternarVisibilidadeDasNotas)
    })

    document.querySelector(CHECK_MARCAR_TODAS).addEventListener('click', marcarTodasSessoes)
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

  document.querySelector(`[name="${NOME_TABELA_HTML}"] tbody`)
    .innerHTML = `<tr><td colspan="6">${MENSAGENS.nova_busca}</td></tr>`

  document.querySelector(BOTAO_GERAR_RELATORIO).classList.add('d-none')
  document.querySelector(BOTAO_LIMPAR_BUSCA).classList.add('d-none')

  limparCampos()
}

/**
 * Limpa e desabilita os inputs de data
 * @param {Event} event
 * @return {undefined}
 */
 const desabilitarDatas = (event) => {
  if (event !== undefined) {
    event.preventDefault();
  }

  document.querySelectorAll(`input[type="date"]`).forEach((dateInput) => {
    dateInput.disabled = !dateInput.disabled
    dateInput.value = ''
  })
}

/**
 * Limpa e desabilita os inputs de data
 * @param {Event} event
 * @return {undefined}
 */
const alternarVisibilidadeDasNotas = (event) => {
  if (event !== undefined) {
    event.preventDefault();
  }

  const estaFechado = event.currentTarget.classList.contains('table-column-long-text-closed')
  if (estaFechado) {
    event.currentTarget.classList.remove('table-column-long-text-closed')
    event.currentTarget.classList.add('table-column-long-text-open')
    return
  }

  event.currentTarget.classList.remove('table-column-long-text-open')
  event.currentTarget.classList.add('table-column-long-text-closed')
}

/**
 * Marca todos os checkboxes para incluir sessões no relatório
 * @param {Event} event 
 */
const marcarTodasSessoes = (event) => {
  document.querySelectorAll(CHECK_INCLUIR_SESSAO).forEach((check) => {
    check.checked = event.currentTarget.checked
  })
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

  const sessoesEscolhidasElements = document.querySelectorAll(CHECK_INCLUIR_SESSAO_MARCADA)

  if (sessoesEscolhidasElements.length === 0) {
    alert(MENSAGENS.nenhuma_sessao_escolhida)
    return
  }

  let sessoesEscolhidasIds = []
  sessoesEscolhidasElements.forEach((sessao) => {
    sessoesEscolhidasIds.push(sessao.dataset.id)
  })

  const idPaciente = sessoesEscolhidasElements[0].dataset.id_paciente

  let dadosPaciente = await ProntuarioRepositorio.find(idPaciente)
  let respostasAnamnese = await RespostasAnamneseRepositorio.buscarRespostasPorIdDoPaciente(idPaciente)
  let dadosSessoes = await SessaoRepositorio
    .findAllByIds(sessoesEscolhidasIds, 'data_hora_inicio')

  if (dadosPaciente.length == 0 ) {
    alert(MENSAGENS.paciente_cadastro_incompleto)
    return
  }

  dadosPaciente = dadosPaciente[0]

  dadosSessoes.map((sessao) => {
    sessao.descricao = sessao.descricao === null 
      ? MENSAGENS.notas_vazias
      : sessao.descricao
  })

  GeradorDePdf.construirPaginas(dadosPaciente, respostasAnamnese, dadosSessoes)
}

// Inicialização
window.addEventListener('DOMContentLoaded', () => {
  inicializar()
})
