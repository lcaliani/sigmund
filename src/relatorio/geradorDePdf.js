const { jsPDF } = require('jspdf')

const typography = {
  textSize: 14,
  subtitleSize: 24,
  titleSize: 36,
}

const spacing = {
  paragraph: 10,
}

const adicionarTitulo = (doc, titleText = 'Título', y = 15) => {
  doc.setFont('Helvetica', 'normal', 'bold')
  doc.setFontSize(typography.titleSize)

  doc.text(titleText,
    (doc.internal.pageSize.width / 2),
    y,
    { align: 'center' }
  )

  return y
}

const construirPaginas = (event) => {
    if (event !== undefined) {
      event.preventDefault();
    }

    const doc = new jsPDF()

    let currentVerticalPosition = 0
    
    currentVerticalPosition += adicionarTitulo(doc, 'Relatório')
    currentVerticalPosition += currentVerticalPosition + 10

    let text = ''

    // Subtitulo dados cadastrais
    text = 'Dados cadastrais'
    doc.setFontSize(typography.subtitleSize)
    doc.text(text, 10, currentVerticalPosition)
    currentVerticalPosition += spacing.paragraph

    // Tamanho de texto comum
    doc.setFontSize(typography.textSize)
    
    // Nome do paciente
    doc.setFont('Helvetica', 'normal', 'bold')
    text = 'Nome: '
    doc.text(text, 10, currentVerticalPosition)

    doc.setFont('Helvetica', 'normal', 'normal')
    doc.text('Leonardo Caliani Ruellas', 26, currentVerticalPosition)
    currentVerticalPosition += spacing.paragraph
    
    // Nome do pai do paciente
    doc.setFont('Helvetica', 'normal', 'bold')
    text = 'Nome do pai: '
    doc.text(text, 10, currentVerticalPosition)

    doc.setFont('Helvetica', 'normal', 'normal')
    doc.text('Pai de Leonardo Caliani Ruellas', 42, currentVerticalPosition)
    currentVerticalPosition += spacing.paragraph
    
    // Nome da mãe do paciente
    doc.setFont('Helvetica', 'normal', 'bold')
    text = 'Nome da mãe: '
    doc.text(text, 10, currentVerticalPosition)

    doc.setFont('Helvetica', 'normal', 'normal')
    doc.text('Mãe de Leonardo Caliani Ruellas', 45, currentVerticalPosition)
    currentVerticalPosition += spacing.paragraph

    // Data de nascimento
    doc.setFont('Helvetica', 'normal', 'bold')
    text = 'Data de nascimento: '
    doc.text(text, 10, currentVerticalPosition)

    doc.setFont('Helvetica', 'normal', 'normal')
    doc.text('17/06/1994', 59, currentVerticalPosition)
    currentVerticalPosition += spacing.paragraph

    // Cidade
    doc.setFont('Helvetica', 'normal', 'bold')
    text = 'Cidade: '
    doc.text(text, 10, currentVerticalPosition)

    doc.setFont('Helvetica', 'normal', 'normal')
    doc.text('Marilia', 29, currentVerticalPosition)
    currentVerticalPosition += spacing.paragraph

    // Endereço
    doc.setFont('Helvetica', 'normal', 'bold')
    text = 'Endereço: '
    doc.text(text, 10, currentVerticalPosition)

    doc.setFont('Helvetica', 'normal', 'normal')
    doc.text('Rua de Leonardo Caliani Ruellas, 59 - Apto 522', 35, currentVerticalPosition)
    currentVerticalPosition += spacing.paragraph

    // doc.text('Relatório do paciente aaaa',
    //   (doc.internal.pageSize.width / 2),
    //   15,
    //   { align: 'center' }
    // )
  
    doc.setFont('Helvetica', 'normal', 'normal')
    doc.save('ola_mundo.pdf')
  }

module.exports = { construirPaginas }