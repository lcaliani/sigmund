const ProntuarioRepositorio = new (require('../prontuario/ProntuarioRepositorio'))

/**
* Seletor que identifica o formulário de manipulação de dados desse contexto
*/
const ID_FORMULARIO_HTML = '#formulario-busca'

/**
 * Campos do formulário
 */
const FORMULARIO = {
  'todas_sessoes_check' : `${ID_FORMULARIO_HTML}[name="todas_as_sessoes"]`
}

/**
* Mensagens de feedback
*/
const MENSAGENS = {
    zero_registros: 'Nenhum registro encontrado',
    erro_generico: 'Houve um erro ao realizar a operação. Tente novamente.',
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
 * Vincula as ações dos botões na tela
 */
const vincularAcoes = () => {
  // Buscar dados
  // @todo

  // Limpeza dos inputs ao cancelar edição
  document.querySelector(`${ID_FORMULARIO_HTML} .cancel-edit`).addEventListener('click', limparCampos)
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

// Inicialização
window.addEventListener('DOMContentLoaded', () => {
  inicializar()
})
