
const modal = require('../plugins/modal/modal')

const ProntuarioRepositorio = new (require('../prontuario/ProntuarioRepositorio'))

const repositorio = new (require('./SessaoRepositorio'))

const DateHelper = require('../plugins/date/DateHelper')

/**
 * Modal de marcação de sessão
 */
const MODAL = {
  ID_SELETOR: '#modal-marcar-sessao',
  ID: 'modal-marcar-sessao',
  ID_BOTAO_SELETOR: '#sessoes-adicionar-marcacao',
  ID_BOTAO: 'sessoes-adicionar-marcacao',
}
/**
* Seletor que identifica o formulário de manipulação de dados desse contexto
*/
const ID_FORMULARIO_HTML = '#formulario-sessao'

/**
* Mensagens de feedback
*/
const MENSAGENS = {
    zero_registros: 'Nenhum registro encontrado',
    sucesso_gravacao: 'Sessão gravada com sucesso!',
    sucesso_remocao: 'Sessão removida com sucesso!',
    erro_generico: 'Houve um erro ao realizar a operação. Tente novamente.',
}

/**
 * Carrega na tela os dados cadastrados na tabela
 * @return {undefined}
 */
async function inicializar() {
  inicializarCalendario()
  modal.setUpModal(MODAL.ID, MODAL.ID_BOTAO)

  document.querySelector(`${ID_FORMULARIO_HTML} select[name="id_paciente"]`).innerHTML = await montarSelectHtml()

  vincularAcoes()
}

/**
 * Busca no banco, recupera as sessões e adiciona no calendário
 * @param {Calendar} calendario Objeto do FullCalendar
 */
const recuperarSessoes = async (calendario) => {
  if (!calendario) {
    console.warn('Calendário não foi carregado.')
  }

  let registros = await repositorio.todasComPaciente()

  if (registros.length === 0) {
    console.log('Sem sessões marcadas.')
  }
  
  registros.forEach((sessao) => {
    const dataHoraInicio = new DateHelper(sessao.data_hora_inicio)
    const dataHoraFim = new DateHelper(sessao.data_hora_fim)

    const event = {
      title: sessao.nome_paciente,
      start: sessao.data_hora_inicio,
      end: sessao.data_hora_fim,
      extendedProps: {
        id_paciente: sessao.id_paciente,
        data_inicio: dataHoraInicio.date,
        hora_inicio: dataHoraInicio.time,
        data_fim: dataHoraFim.date,
        hora_fim: dataHoraFim.time,
        descricao: sessao.descricao,
        status: sessao.status,
        id: sessao.id,
      }
    }
    calendario.addEvent(event)
  })
}
/**
 * Busca e retorna o html da lista dos pacientes no select de pacientes para marcação
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
 * Vincula as ações dos botões na tela
 */
const vincularAcoes = () => {
  // Gravar dados
  document.querySelector(ID_FORMULARIO_HTML).addEventListener('submit', save)

  // Limpeza dos inputs ao cancelar edição
  document.querySelector(`${ID_FORMULARIO_HTML} .cancel-edit`).addEventListener('click', limparCampos)
}

/**
 * Recupera os valores dos inputs do prontuario no formato {input-name: value}
 * @return {object}
 */
function recuperarDadosDoFormulario() {
  let inputs = Array.from(document.querySelectorAll(`${ID_FORMULARIO_HTML} input,textarea`))
      
  inputs = inputs.reduce((accumulator, input) =>
      ({ ...accumulator, [input.name]: input.value || null}), {}
  )

  // Formatação dos dados de data e hora
  inputs.data_hora_inicio = inputs.data_inicio + ' ' + inputs.hora_inicio
  inputs.data_hora_fim = inputs.data_fim + ' ' + inputs.hora_fim
  delete inputs.data_inicio
  delete inputs.hora_inicio
  delete inputs.data_fim
  delete inputs.hora_fim

  inputs.id_paciente = document.querySelector(`${ID_FORMULARIO_HTML} select`).value

  return inputs
}

/**
 * Grava os dados
 * @param {object} event Evento de submit do form
 * @return {undefined}
 */
const save = async (event) => {
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

  alert(message)

  // Fechar o modal
  document.querySelector(`${MODAL.ID_SELETOR} .close`).click()

  // Limpar o modal
  limparCampos()

  // Re-inicializar
  inicializar()
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

  modal.closeModal(MODAL.ID)
}

/**
 * Preenche os inputs com os valores recebidos
 * @param {object} valores 
 * @return {undefined}
 */
const preencherCampos = ({
  id_paciente,
  data_inicio,
  hora_inicio,
  data_fim,
  hora_fim,
  descricao,
  status,
  id
} = valores) => {
  // Campos dos dados
  if (id_paciente) {
    document.querySelector(`${ID_FORMULARIO_HTML} [name="id_paciente"]`).value = id_paciente
  }
  if (data_inicio) {
    document.querySelector(`${ID_FORMULARIO_HTML} [name="data_inicio"]`).value = data_inicio
  }
  if (hora_inicio) {
    document.querySelector(`${ID_FORMULARIO_HTML} [name="hora_inicio"]`).value = hora_inicio
  }
  if (data_fim) {
    document.querySelector(`${ID_FORMULARIO_HTML} [name="data_fim"]`).value = data_fim
  }
  if (hora_fim) {
    document.querySelector(`${ID_FORMULARIO_HTML} [name="hora_fim"]`).value = hora_fim
  }
  if (descricao) {
    document.querySelector(`${ID_FORMULARIO_HTML} [name="descricao"]`).value = descricao
  }
  if (status) {
    document.querySelector(`${ID_FORMULARIO_HTML} [name="status"]`).value = status
  }
  if (id) {
    document.querySelector(`${ID_FORMULARIO_HTML} [name="id"]`).value = id
  }

  // Botões padrão
  document.querySelector(`${ID_FORMULARIO_HTML} .edit-status`).classList.remove('d-none')
  document.querySelector(`${ID_FORMULARIO_HTML} .cancel-edit`).classList.remove('d-none')
}

/**
 * Inicializa o calendário na tela, montando o template e carregando os dados
 */
const inicializarCalendario = () => {
  const data = new Date()
  const horaAtual = `${data.getHours()}:${data.getMinutes()}}`
  let elementoCalendario = document.getElementById('calendar');
  let calendario = new FullCalendar.Calendar(elementoCalendario, {
    // layout
    initialView: 'timeGridWeek',
    allDaySlot: false,
    nowIndicator: true,
    buttonIcons: {
      prev: 'chevron-left',
      next: 'chevron-right',
    },
    buttonText: { today: 'Hoje' },
    height: 585,

    // Idioma
    locale: 'pt-br',

    eventTimeFormat: {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    },
    scrollTime: horaAtual,
    eventClick: (info) => {
      preencherCampos(info.event.extendedProps)
      modal.openModal(MODAL.ID_BOTAO)
    },
    dateClick: (info) => {
      const dataHora = new DateHelper(info.dateStr)
      const campos = {
        data_inicio: dataHora.date,
        hora_inicio: dataHora.time,
        data_fim: dataHora.date,
      }
      preencherCampos(campos)
      modal.openModal(MODAL.ID_BOTAO)
    }
  });

  calendario.render()

  recuperarSessoes(calendario)
}

document.addEventListener('DOMContentLoaded', function() {
  inicializar()
})


