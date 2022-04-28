const AdmZip = require("adm-zip");
let ipc = require('electron').ipcRenderer;

const BOTOES = {
  BACKUP: '#botao-criar-backup',
  IMPORTAR: '#botao-recuperar-backup',
}

/**
 * Realiza o backup do banco, criando uma réplica compactada
 */
async function backup() {
  try {
    const zip = new AdmZip();
    const databasePath = `${process.cwd()}/database`
    const parsedDate = `${new Date().toLocaleDateString().replaceAll('/', '-')}_${new Date().toLocaleTimeString().replaceAll(':', '-')}`
    const outputFile = `${databasePath}/Sigmund_backup_${parsedDate}.zip`

    zip.addLocalFile(`${databasePath}/database.db`)
    zip.writeZip(outputFile);
    ipc.send(
      'backup_create_success',
      {
        dados: {
          outputPath: databasePath,
          outputFile: outputFile
        }
      }
  )
  } catch(e) {
    alert('Houve algum erro ao criar o backup. Tente novamente.')
    console.warn(e)
  }
}

/**
 * Vincula ações aos botões
 */
const vincularAcoes = () => {
  document.querySelector(BOTOES.BACKUP).addEventListener('click', backup)

  // document.querySelector(BOTOES.importar).addEventListener('click', importar)
}


window.addEventListener('DOMContentLoaded', async () => {
  vincularAcoes()
})
