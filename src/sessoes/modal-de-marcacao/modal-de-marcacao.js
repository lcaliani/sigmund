
const modal = require('../../plugins/modal/modal')

const ProntuarioRepositorio = new (require('../../prontuario/ProntuarioRepositorio'))
const repositorio = new (require('../SessaoRepositorio'))

/**
 * Eventos customizados disponíveis:
 * 
 * - salvar_sessao: Disparado ao tentar salvar um registro de sessao
 * - desmarcar_sessao: Disparado ao tentar inativar um registro de sessao
 */

/**
 * Modal de marcação de sessão
 */
const MODAL = {
  ID_SELETOR: '#modal-marcar-sessao',
  ID: 'modal-marcar-sessao',
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
    sucesso_remocao: 'Sessão desmarcada com sucesso!',
    erro_generico: 'Houve um erro ao realizar a operação. Tente novamente.',
}

/**
 * Carrega na tela os dados cadastrados na tabela
 * @param {string} botaoInicializadorDoModal Id do botão inicializador do modal
 * @return {undefined}
 */
async function inicializar(botaoInicializadorDoModal) {
    modal.setUpModal(MODAL.ID, botaoInicializadorDoModal || MODAL.ID_BOTAO)
    document.querySelector(`${ID_FORMULARIO_HTML} select[name="id_paciente"]`).innerHTML = await montarSelectHtml()
    vincularAcoes()
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

  // Desmarcar sessão
  document.querySelector(`${ID_FORMULARIO_HTML} [name="desmarcar-sessao"]`).addEventListener('click', desmarcarSessao)
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
  
  /**
   * Status da operação de gravação. Default: true (sucesso)
   */
  const detalheEvento = {
    detail: {
      status: true
    }
  }

  if (!wasSaved) {
      message = MENSAGENS.erro_generico
      alert(message)

      detalheEvento.detail.status = false
      let evento = new CustomEvent('salvar_sessao', detalheEvento);
      document.dispatchEvent(evento);
      return
  }

  alert(message)

  let evento = new CustomEvent('salvar_sessao', detalheEvento);
  document.dispatchEvent(evento);

  reinicializarCalendario()
}

/**
 * Desmarca a sessão existente e dá um feedback na tela
 * @param {Event} event Evento que ativou essa função
 * @returns {undefined}
 */
const desmarcarSessao = async (event) => {
  event.preventDefault()

  const idSessao = document.querySelector(`${ID_FORMULARIO_HTML} [name="id"]`).value

  const foiDesmarcada = await repositorio.delete(idSessao)
  
  /**
   * Status da operação de gravação. Default: true (sucesso)
   */
    const detalheEvento = {
    detail: {
      status: true
    }
  }

  if (!foiDesmarcada) {
      alert(MENSAGENS.erro_generico)
      detalheEvento.detail.status = false
      let evento = new CustomEvent('desmarcar_sessao', detalheEvento);
      document.dispatchEvent(evento);
      return
  }

  alert(MENSAGENS.sucesso_remocao)

  let evento = new CustomEvent('desmarcar_sessao', detalheEvento);
  document.dispatchEvent(evento);

  reinicializarCalendario()
}

/**
 * Fecha qualquer modal aberto, limpa seus campos e reinicializa o calendário,
 * carregando os dados atualizados
 * @return {undefined}
 */
const reinicializarCalendario = () => {
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

  document.querySelector(`${ID_FORMULARIO_HTML} [name="desmarcar-sessao"]`).classList.add('d-none')
  if (id) {
    document.querySelector(`${ID_FORMULARIO_HTML} [name="id"]`).value = id
    document.querySelector(`${ID_FORMULARIO_HTML} [name="desmarcar-sessao"]`).classList.remove('d-none')
  }

  // Botões padrão
  document.querySelector(`${ID_FORMULARIO_HTML} .edit-status`).classList.remove('d-none')
  document.querySelector(`${ID_FORMULARIO_HTML} .cancel-edit`).classList.remove('d-none')
}

/**
 * Abre o modal de edição de sessão
 */
const openModal = () => {
    modal.openModal(MODAL.ID_BOTAO)
}

module.exports = {
    inicializar,
    preencherCampos,
    openModal,
}
