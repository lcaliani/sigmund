const DateHelper = require('../plugins/date/DateHelper')

let pdfMake = require('pdfmake/build/pdfmake.js');
let pdfFonts = require('pdfmake/build/vfs_fonts.js');
pdfMake.vfs = pdfFonts.pdfMake.vfs;

/**
 * Constrói o template de dados cadastrais do paciente
 * @param {object} docDefinition
 * @param {object<string,mixed>} dadosPaciente
 */
const construirDadosCadastrais = (docDefinition, {
  cidade,
  data_nascimento,
  endereco,
  nome,
  nome_mae,
  nome_pai,
} = dadosPaciente) => {
  data_nascimento = new DateHelper(data_nascimento)

  docDefinition.content.push()
  docDefinition.content.push({ text: 'Dados cadastrais', style: 'subheader'})
  docDefinition.content.push({ text: ['Nome: ', { text: nome , style: 'normal' }], style: 'strong' })
  docDefinition.content.push({ text: ['Data de nascimento: ', { text: data_nascimento.dateBR , style: 'normal' }],
    style: 'strong' })
  docDefinition.content.push({ text: ['Nome da mãe: ', { text: nome_mae , style: 'normal' }], style: 'strong' })
  docDefinition.content.push({ text: ['Nome do pai: ', { text: nome_pai , style: 'normal' }], style: 'strong' })
  docDefinition.content.push({
      text: [
          'Cidade:',
          {
              text: cidade,
              style: 'normal'
          },
          '    ',
          'Endereço: ',
          {
              text: endereco,
              style: 'normal',
          },
      ],
      style: 'strong'
  })
  docDefinition.content.push(' ')
}

/**
 * Constrói o template de perguntas e respostas de anamnese no pdf
 * @param {object} docDefinition Template do pdf em formato de objeto
 * @param {object} respostasAnamnese Objeto com os dados das perguntas e respostas de anamnese
 */
const construirAnamnese = (docDefinition, respostasAnamnese) => {
  // Anamnese
  docDefinition.content.push({ text: 'Anamnese', style: 'subheader'})
  respostasAnamnese.forEach((anamnese) => {
    docDefinition.content.push({ text: anamnese.pergunta, style: 'strong', lineHeight: 1 })
    docDefinition.content.push({ text: anamnese.resposta, style: 'normal', lineHeight: 1 })
    docDefinition.content.push(' ')
  })
  docDefinition.content.push({ text: '', pageBreak: 'after'})
}

/**
 * Constrói o template de sessões de anamnese no pdf
 * @param {object} docDefinition Template do pdf em formato de objeto
 * @param {object} sessoes Objeto com os dados das sessões
 */
const construirSessoes = (docDefinition, sessoes) => {
  docDefinition.content.push({ text: 'Sessões', style: 'header' })
  sessoes.forEach((sessao) => {
    const dataHoraInicio = new DateHelper(sessao.data_hora_inicio)
    const dataHoraFim = new DateHelper(sessao.data_hora_fim)

    docDefinition.content.push({ text: dataHoraInicio.dateBR, style: 'subheader'})

    docDefinition.content.push({ 
      text: [
        'Data e hora de início: ',
        {
          text: `${dataHoraInicio.dateBR} as ${dataHoraInicio.time}` ,
          style: 'normal'
        }
      ], style: 'strong' }
    )

    docDefinition.content.push({
      text: [
        'Data e hora de finalização: ',
        {
          text: `${dataHoraFim.dateBR} as ${dataHoraFim.time}` ,
          style: 'normal'
        }
      ], style: 'strong'
    })

    docDefinition.content.push({ text: 'Notas:', style: 'strong', lineHeight: 1 })
    docDefinition.content.push({ text: sessao.descricao, style: 'normal', lineHeight: 1 })
    docDefinition.content.push(' ')
    docDefinition.content.push(' ')
  })
}

/**
 * Gera o pdf
 * @param {object} dadosPaciente Informações dos dados do paciente
 * @param {object} respostasAnamnese Informações das perguntas e respostas de anamnese
 * @param {object} sessoes Informações das sessões
 */
const construirPaginas = (dadosPaciente, respostasAnamnese, sessoes) => {

  const styles = {
    header: {
      fontSize: 36,
      bold: true,
      alignment: 'center',
      lineHeight: 1.5,
    },
    subheader: {
      fontSize: 24,
      bold: true,
      alignment: 'left',
      lineHeight: 1.5,
    },
    strong: {
      bold: true,
      alignment: 'left',
      lineHeight: 1.5,
    },
    normal: {
      bold: false,
      alignment: 'left',
      lineHeight: 1.5,
    }
  }

  const defaultStyle = {
    fontSize: 14,
  }

  const currentDate = new Date().toLocaleString()
  const documentTitle = `Relatório_${dadosPaciente.nome}_${currentDate}`
  let docDefinition = {
    content: [ { text: 'Relatório', style: 'header' } ],
    styles,
    defaultStyle,
    info: {
      title: documentTitle,
    }
  }

  construirDadosCadastrais(docDefinition, dadosPaciente)
  construirAnamnese(docDefinition, respostasAnamnese)
  construirSessoes(docDefinition, sessoes)

  pdfMake.createPdf(docDefinition).download(documentTitle);
}

module.exports = { construirPaginas }
