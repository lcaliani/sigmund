const DateHelper = require('../plugins/date/DateHelper')

let pdfMake = require('pdfmake/build/pdfmake.js');
let pdfFonts = require('pdfmake/build/vfs_fonts.js');
pdfMake.vfs = pdfFonts.pdfMake.vfs;

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
        'Data e hora de inicio: ', 
        {
          text: `${dataHoraInicio.dateBR} as ${dataHoraInicio.time}` ,
          style: 'normal'
        }
      ], style: 'strong' }
    )

    docDefinition.content.push({ 
      text: [
        'Data e hora de finalizaçao: ', 
        {
          text: `${dataHoraFim.dateBR} as ${dataHoraFim.time}` ,
          style: 'normal'
        }
      ], style: 'strong' }
    )

    docDefinition.content.push({ text: 'Notas:', style: 'strong', lineHeight: 1 })
    docDefinition.content.push({ text: sessao.descricao, style: 'normal', lineHeight: 1 })
    docDefinition.content.push(' ')
  })
}

/**
 * Gera o pdf
 * @param {object} dadosPaciente Informações dos dados do paciente
 * @param {object} respostasAnamnese Informações das perguntas e respostas de anamnese
 * @param {object} sessoes Informações das sessões
 */
const construirPaginas = ({
  cidade,
  data_nascimento,
  endereco,
  nome,
  nome_mae,
  nome_pai,
} = dadosPaciente, respostasAnamnese, sessoes) => {

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

  data_nascimento = new DateHelper(data_nascimento)
  let docDefinition = {
    content: [
      { text: 'Relatorio', style: 'header' },
      { text: 'Dados cadastrais', style: 'subheader'},
      { text: ['Nome: ', { text: nome , style: 'normal' }], style: 'strong' },
      { text: ['Data de nascimento: ', { text: data_nascimento.dateBR , style: 'normal' }], style: 'strong' },
      { text: ['Nome da mae: ', { text: nome_mae , style: 'normal' }], style: 'strong' },
      { text: ['Nome do pai: ', { text: nome_pai , style: 'normal' }], style: 'strong' },
      { 
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
      },
      ' ',
    ],
  
    styles,
    defaultStyle,
  }

  construirAnamnese(docDefinition, respostasAnamnese)
  construirSessoes(docDefinition, sessoes)

  pdfMake.createPdf(docDefinition).open();
}

module.exports = { construirPaginas }
