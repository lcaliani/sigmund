
const w3 = require('../plugins/w3/w3')

const Repositorio = new (require('./SessaoRepositorio'))
const DateHelper = require('../plugins/date/DateHelper')

const modalNew = require('./modal-de-marcacao/modal-de-marcacao')

/**
 * Carrega na tela os dados cadastrados na tabela
 * @return {undefined}
 */
async function inicializar() {
  // Garantir que o JS atual só seja executado após todos os templates terem sido carregados
  // Template carregado: modal-de-marcacao.html
  w3.includeHTML(async () => {
    inicializarCalendario()
    modalNew.inicializar()

    // Comunicação através de eventos com o plugin de modal
    // Após salvar ou desmarcar, reinicializa o calendário atualizado
    document.addEventListener('salvar_sessao', inicializar)
    document.addEventListener('desmarcar_sessao', inicializar)
  })
}

/**
 * Busca no banco, recupera as sessões e adiciona no calendário
 * @param {Calendar} calendario Objeto do FullCalendar
 */
const recuperarSessoes = async (calendario) => {
  if (!calendario) {
    console.warn('Calendário não foi carregado.')
  }

  let registros = await Repositorio.todasComPaciente()

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
    /**
     * Listener disparado ao clicar em um evento do calendário
     * Abre o modal preenchido com os dados do evento
     * @param {object} info Dados do evento
     */
    eventClick: (info) => {
      modalNew.preencherCampos(info.event.extendedProps)
      modalNew.openModal()
    },
    /**
     * Recupera data e hora do ponto clicado, preenchendo o modal com esses dados
     * @param {object} info Dados e data e hora do ponto clicado
     */
    dateClick: (info) => {
      const dataHora = new DateHelper(info.dateStr)
      const hora_fim = new DateHelper(
        new Date(dataHora.fullDate.getTime() + (50 * 60000)) // 50 minutos p/ frente
      )
      const campos = {
        data_inicio: dataHora.date,
        hora_inicio: dataHora.time,
        data_fim: dataHora.date,
        hora_fim: hora_fim.time
      }

      modalNew.preencherCampos(campos, false)
      modalNew.openModal()
    }
  });

  calendario.render()

  recuperarSessoes(calendario)
}

document.addEventListener('DOMContentLoaded', function() {
  inicializar()
})
