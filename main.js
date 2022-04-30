const {
  app,
  BrowserWindow,
  ipcMain,
  Menu,
  MenuItem,
  shell,
} = require('electron')

const customDialogs = require('./components/customDialogs')

const path = require('path')
const fs = require('fs')

/**
 * Criar janela principal
 */
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

  prepararJanelaDeProntuarios(janelaPrincipal)
  prepararJanelaDeSessoes(janelaPrincipal)
  prepararJanelaDeListagemDeSessoes(janelaPrincipal)
  prepararJanelaDeRelatorios(janelaPrincipal)

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
        },
        {
          label: 'Backup e recuperação de dados',
          acelerator: process.platform === 'darwin' ? 'Alt+Cmd+I' : 'Alt+Shift+A',
          click: () => {
            prepararJanelaDeBackup(janelaPrincipal)
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
    if (process.env.APP_ENV == 'dev') {
      janelaProntuarios.webContents.openDevTools()
    }
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
    if (process.env.APP_ENV == 'dev') {
      janelaDeSessoes.webContents.openDevTools()
    }
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
    if (process.env.APP_ENV == 'dev') {
      janelaDeRoteiro.webContents.openDevTools()
    }
    janelaDeRoteiro.show()
    janelaDeRoteiro.setMenu(new Menu());
}

/**
 * Abre a janela de backup
 * @param {string} janelaPai
 * @return {undefined}
 **/
 const prepararJanelaDeBackup = (janelaPai) => {
  const opcoes = {
      parent: janelaPai,
      modal: true,
      center: true,
      title: 'Backup e Importação de dados',
      width: 640,
      height: 360,
      webPreferences: {
          nodeIntegration: true,
          contextIsolation: false,
      },
      resizable: false,
  }

  let janela = new BrowserWindow(opcoes)

  /** @windows @mac only */
  janela.movable = false

  janela.loadFile('./src/backup/backup.html')
  if (process.env.APP_ENV == 'dev') {
    janela.webContents.openDevTools()
  }
  janela.show()
  janela.setMenu(new Menu());

  ipcMain.on('backup_create_success', (evento, dadosRecebidos) => {
    customDialogs.dialogCriarBackup(janela, dadosRecebidos.dados)
  })

  ipcMain.on('backup_import_select', async (evento, dadosRecebidos) => {
    const backupPath = await customDialogs.dialogRecuperarBackup(janela, dadosRecebidos.dados)
    
    const nothingSelected = backupPath === null
    if (nothingSelected) {
      return
    }

    janela.webContents.send('backup_path_was_selected', backupPath)
  })

  ipcMain.on('backup_recovered_successfully', (event, data) => {
    fs.unlink(data.dados.zipFile, (error) => {
      if (error) {
        console.warn('Erro ao remover arquivo antigo de backup.', error)
      }
      console.log('Arquivo antigo de backup apagado com sucesso.')
    })
  })
}


/**
 * "Instala" o event listener que fica ouvindo o evento "abrir_janela_lista_de_sessoes"
 * e a partir dele abre a janela de listagem de sessoes
 * @param {string} janelaPai
 * @return {undefined}
 **/
const prepararJanelaDeListagemDeSessoes = (janelaPai) => {
  ipcMain.on('abrir_janela_lista_de_sessoes', (evento, dadosRecebidos) => {
    const opcoes = {
        parent: janelaPai,
        modal: true,
        center: true,
        title: `Listagem de sessoes de ${dadosRecebidos.dados.nome_paciente}`,
        width: 1280,
        height: 720,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
        },
        resizable: false,
    }

    let janela = new BrowserWindow(opcoes)

    /** @windows @mac only */
    janela.movable = false

    janela.loadFile('./src/sessoes/listagem/lista-de-sessoes.html')
    if (process.env.APP_ENV == 'dev') {
      janela.webContents.openDevTools()
    }
    janela.show()
    janela.setMenu(new Menu());

    janela.webContents.on('did-finish-load', () => {
      janela.webContents.send('dados_enviados_do_paciente', dadosRecebidos.dados)
    })
  })
}

/**
 * "Instala" o event listener que fica ouvindo o evento "abrir_janela_lista_de_sessoes"
 * e a partir dele abre a janela de listagem de sessoes
 * @param {string} janelaPai
 * @return {undefined}
 **/
 const prepararJanelaDeRelatorios = (janelaPai) => {
  ipcMain.on('abrir_janela_relatorios', (evento, dadosRecebidos) => {
    const opcoes = {
        parent: janelaPai,
        modal: true,
        center: true,
        title: 'Relatórios',
        width: 1280,
        height: 720,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
        },
        resizable: false,
    }

    let janela = new BrowserWindow(opcoes)

    /** @windows @mac only */
    janela.movable = false

    janela.loadFile('./src/relatorio/relatorio.html')
    if (process.env.APP_ENV == 'dev') {
      janela.webContents.openDevTools()
    }
    janela.show()
    janela.setMenu(new Menu());
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