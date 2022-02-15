const {
  app,
  BrowserWindow,
  ipcMain,
} = require('electron')

const path = require('path')

const criarJanelaPrincipal = () => {
  const janelaPrincipal = new BrowserWindow({
    width: 1200,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: true,
      contextIsolation: false,
    }
  })

  janelaPrincipal.loadFile('index.html')

  // @todo: Deixar dinâmico somente para dev
  janelaPrincipal.webContents.openDevTools()

  console.log('A janela da aplicação foi criada!')

  abrirJanelaDeProntuariosEAnamnese(janelaPrincipal)
}

/**
 * "Instala" o event listener que fica ouvindo o evento "abrir_janela_prontuarios_e_anamnese"
 * e a partir dele abre a janela de Prontuários e anamnese
 * @param {string} janelaPai
 * @return {undefined}
 **/
function abrirJanelaDeProntuariosEAnamnese(janelaPai) {
    ipcMain.on('abrir_janela_prontuarios_e_anamnese', (event, customerData) => {
    console.log('Abrindo janela de Prontuários e anamnese!')

    const opcoes = {
        parent: janelaPai,
        modal: true,
        center: true,
        title: 'Prontuários e anamnese',
        width: 1028,
        height: 528,
        webPreferences: {
            nodeIntegration: true
        },
        resizable: false,
    }

    let janelaProntuarios = new BrowserWindow(opcoes)

    /** @windows @mac only */
    janelaProntuarios.movable = false

    janelaProntuarios.loadFile('prontuario.html')
    
    // janelaPai.webContents.on('did-finish-load', () => {
    //     janelaPai.webContents.openDevTools()
    //     janelaPai.webContents.send('customerWasChosen', customerData)
    // })
    janelaProntuarios.show()
  })
}

app.whenReady().then(() => {
  criarJanelaPrincipal()

    // Fix para MacOS, para abrir janela somente se não tiver outra já aberta
    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        criarJanelaPrincipal()
      }
    })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})