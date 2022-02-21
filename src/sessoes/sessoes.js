
const modal = require('../plugins/modal/modal')

const ProntuarioRepositorio = new (require('../prontuario/ProntuarioRepositorio'))

const repositorio = new (require('./SessaoRepositorio'))

/**
 * Id do modal de marcação de sessão
 */
const MODAL_ID = '#modal-marcar-sessao'

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
  modal.setUpModal('modal-marcar-sessao', 'sessoes-adicionar-marcacao')

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
    calendario.addEvent({
        title: sessao.nome_paciente,
        start: sessao.data_hora_inicio,
        end: sessao.data_hora_fim,
      }
    )
  })
}
/**
 * Busca e retorna o html da lista dos pacientes no select de pacientes para marcação
 * @returns {Promise<string>} HTML com os <option> do <select>, montados a partir do banco
 */
const montarSelectHtml = async () => {
  const pacientes = await ProntuarioRepositorio.index('nome')
  console.log('pacientes: ', pacientes)
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
  document.querySelector(`${MODAL_ID} .close`).click()

  // Limpar o modal
  limparCampos()

  // Re-inicializar
  inicializar()
}

/**
 * Limpa os campos do formulário, voltando ao estado inicial
 */
const limparCampos = () => {
  document.querySelector(ID_FORMULARIO_HTML).reset()
  document.querySelector(`${ID_FORMULARIO_HTML} input[name="status"]`).value = 1
}

/**
 * Inicializa o calendário na tela, montando o template e carregando os dados
 */
const inicializarCalendario = () => {
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
    eventClick: (info) => {
      alert('Event: ' + info.event.title);
      alert('Coordinates: ' + info.jsEvent.pageX + ',' + info.jsEvent.pageY);
      alert('View: ' + info.view.type);
  
      // change the border color just for fun
      info.el.style.borderColor = 'red';
    }
  });

  calendario.render()

  recuperarSessoes(calendario)
}

document.addEventListener('DOMContentLoaded', function() {
  inicializar()
})


