const {
  app,
  BrowserWindow,
  ipcMain,
  Menu,
  MenuItem,
} = require('electron')

const path = require('path')

const criarJanelaPrincipal = () => {
  const janelaPrincipal = new BrowserWindow({
    width: 1280,
    height: 720,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: true,
      contextIsolation: false,
    }
  })

  janelaPrincipal.loadFile('./src/inicio/index.html')

  // @todo: Deixar dinâmico somente para dev
  janelaPrincipal.webContents.openDevTools()

  console.log('A janela da aplicação foi criada!')

  prepararJanelaDeProntuarios(janelaPrincipal)
  prepararJanelaDeSessoes(janelaPrincipal)

  // Setando menu na tela inicial
  const menu = new Menu()
  menu.append(new MenuItem({
      label: 'Administração',
      submenu: [
          {
              label: 'Perguntas do roteiro de anamnese',
              acelerator: process.platform === 'darwin' ? 'Alt+Cmd+I' : 'Alt+Shift+A',
              click: () => {
                prepararJanelaDeRoteiroDeAnamnese(janelaPrincipal)
              }
          }
      ]
  }))

  janelaPrincipal.setMenu(menu);
}

/**
 * "Instala" o event listener que fica ouvindo o evento "abrir_janela_prontuarios_e_anamnese"
 * e a partir dele abre a janela de Prontuários e anamnese
 * @param {string} janelaPai
 * @return {undefined}
 **/
const prepararJanelaDeProntuarios = (janelaPai) => {
  ipcMain.on('abrir_janela_prontuarios_e_anamnese', (evento, dados) => {
    console.log('Abrindo janela de Prontuários e anamnese!')

    const opcoes = {
        parent: janelaPai,
        modal: true,
        center: true,
        title: 'Prontuários e anamnese',
        width: 1280,
        height: 720,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
        },
        resizable: false,
    }

    let janelaProntuarios = new BrowserWindow(opcoes)

    /** @windows @mac only */
    janelaProntuarios.movable = false

    janelaProntuarios.loadFile('./src/prontuario/prontuario.html')

    janelaProntuarios.webContents.openDevTools()
    
    // janelaPai.webContents.on('did-finish-load', () => {
    //     janelaPai.webContents.openDevTools()
    //     janelaPai.webContents.send('customerWasChosen', customerData)
    // })
    janelaProntuarios.show()
    janelaProntuarios.setMenu(new Menu());
  })
}

/**
 * "Instala" o event listener que fica ouvindo o evento "abrir_janela_sessoes"
 * e a partir dele abre a janela de Sessoes
 * @param {string} janelaPai
 * @return {undefined}
 **/
const prepararJanelaDeSessoes = (janelaPai) => {
    ipcMain.on('abrir_janela_sessoes', (evento, dados) => {
    console.log('Abrindo janela de sessões!')

    const opcoes = {
        parent: janelaPai,
        modal: true,
        center: true,
        title: 'Sessões',
        width: 1280,
        height: 720,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
        },
        resizable: false,
    }

    let janelaDeSessoes = new BrowserWindow(opcoes)

    /** @windows @mac only */
    janelaDeSessoes.movable = false

    janelaDeSessoes.loadFile('./src/sessoes/sessoes.html')

    janelaDeSessoes.webContents.openDevTools()
    
    // janelaPai.webContents.on('did-finish-load', () => {
    //     janelaPai.webContents.openDevTools()
    //     janelaPai.webContents.send('customerWasChosen', customerData)
    // })
    janelaDeSessoes.show()
    janelaDeSessoes.setMenu(new Menu());
  })
}

/**
 * Abre a janela de RoteiroDeAnamnese
 * @param {string} janelaPai
 * @return {undefined}
 **/
const prepararJanelaDeRoteiroDeAnamnese = (janelaPai) => {

    console.log('Abrindo janela de Roteiro de anamnese!')

    const opcoes = {
        parent: janelaPai,
        modal: true,
        center: true,
        title: 'Roteiro de anamnese',
        width: 1280,
        height: 720,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
        },
        resizable: false,
    }

    let janelaDeRoteiro = new BrowserWindow(opcoes)

    /** @windows @mac only */
    janelaDeRoteiro.movable = false

    janelaDeRoteiro.loadFile('./src/roteiro_de_anamnese/roteiro-de-anamnese.html')

    janelaDeRoteiro.webContents.openDevTools()

    // janelaPai.webContents.on('did-finish-load', () => {
    //     janelaPai.webContents.openDevTools()
    //     janelaPai.webContents.send('customerWasChosen', customerData)
    // })
    janelaDeRoteiro.show()
    janelaDeRoteiro.setMenu(new Menu());
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