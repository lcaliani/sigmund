const {
    dialog,
    shell,
} = require('electron')

/**
 * Caixa de diálogo mostrada após realizar backup do banco
 * Permite visualizar a pasta em que o backup foi salvo
 * @param {BrowserWindow} window Janela "pai"
 * @param {object} dados Dados com o caminho do arquivo salvo 
 */
const dialogRecuperarBackup = (window, {outputFile, outputPath} = dados) => {
    const options = {
      type: 'info',
      buttons: ['Abrir pasta do backup', 'Fechar'],
      title: 'Backup de dados',
      message: 'Backup criado com sucesso!',
      detail: `Criado em: ${outputFile}`,
    };
  
    dialog.showMessageBox(window, options).then((response) => {
        const openDirectory = 0
        if (response.response === openDirectory) {
            shell.openPath(outputPath)
        }
    })
}

module.exports = {
    dialogRecuperarBackup,
}