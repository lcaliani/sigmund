const { jsPDF } = require('jspdf')

const typography = {
  textSize: 16,
  titleSize: 36,
}

const addTitle = (doc, titleText = 'Título', y = 15) => {
  doc.setFont('Arial', 'normal', 'bold')
  doc.setFontSize(typography.titleSize)

  doc.text(titleText,
    (doc.internal.pageSize.width / 2),
    y,
    { align: 'center' }
  )

  return y
}

const gerarRelatorio = (event) => {
    if (event !== undefined) {
      event.preventDefault();
    }

    const doc = new jsPDF()

    doc = doc.html(document.querySelector('#pdf'), {
      callback: function (doc) {
        doc.addPage()
        return doc
      },
      x: 10,
      y: 0,
      width: 200,
      windowWidth: 600,
   });

   doc.html(document.querySelector('#pdf'), {
    callback: function (doc) {
      doc.addPage()
      doc.save('ola_mundo.pdf');
    },
      x: 10,
      y: 0,
      width: 200,
      windowWidth: 600,
    });

    // doc.save('ola_mundo.pdf')

    // let currentY = 0
    
    // currentY += addTitle(doc, 'Relatório')
    // currentY += currentY + 10

    // let text = ''
    // doc.setFontSize(typography.textSize)

    // doc.setFont('Arial', 'normal', 'bold')
    // text = 'Nome: '
    // doc.text(text, 10, currentY)

    

    // currentY += currentY + 10
    // doc.setFont('Arial', 'normal', 'normal')
    // doc.text('Leonardo Caliani Ruellas', (doc.context2d.measureText(text).width) + 1, currentY)

    // doc.text('Relatório do paciente aaaa',
    //   (doc.internal.pageSize.width / 2),
    //   15,
    //   { align: 'center' }
    // )
  
    // doc.setFont('Arial', 'normal', 'normal')
    // doc.save('ola_mundo.pdf')
  }

module.exports = { gerarRelatorio }