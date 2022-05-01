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
const dialogCriarBackup = (window, {outputFile, outputPath} = dados) => {
    const options = {
      type: 'info',
      buttons: ['Abrir pasta do backup', 'Fechar'],
      title: 'Backup de dados - Gerar',
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

/**
 * Abre o dialog para a recuperação de backup
 * @param {BrowserWindow} window 
 * @param {dados} object 
 * @returns {string|null}
 */
const dialogRecuperarBackup = async (window, {outputPath} = dados) => {
    const options = {
      type: 'info',
      buttons: ['Escolher arquivo de backup', 'Fechar'],
      title: 'Backup de dados - Recuperar',
      message: 'Recuperação de backup',
      cancelId: 99,
      detail: `Clique no botão "Escolher arquivo de backup" para escolher o arquivo de backup com a extensão [.zip]. O backup será importado logo após a escolha.`,
    };
  
    const selectedOption = await dialog.showMessageBox(window, options)

    const selectBackupFile = 0
    const isCancel = selectedOption.response !== selectBackupFile
    if (isCancel) {
        return null
    }

    const openDialogOptions = {
        type: 'info',
        buttonLabel: 'Confirmar arquivo de backup selecionado',
        title: 'Backup de dados - Escolher arquivo de backup',
        defaultPath: outputPath,
        properties: ['openFile'],
        filters: [
            {
                name: 'Arquivos compactados de banco de dados',
                extensions: ['zip']
            },
        ],
    };
    const selectionData = await dialog.showOpenDialog(window, openDialogOptions)
    if (selectionData.canceled === true) {
        return null
    }
    
    return selectionData.filePaths[0]
}

module.exports = {
    dialogCriarBackup,
    dialogRecuperarBackup,
}