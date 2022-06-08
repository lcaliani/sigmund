const AdmZip = require("adm-zip");
let ipc = require('electron').ipcRenderer;

const BOTOES = {
  BACKUP: '#botao-criar-backup',
  IMPORTAR: '#botao-recuperar-backup',
}

/**
 * Retorna o path absoluto do diretório do banco de dados
 * @returns {string}
 */
const databasePath = () => {
  return process.env.databasePath
}

/**
 * Realiza o backup do banco, criando uma réplica compactada
 */
async function backup() {
  try {
    const zip = new AdmZip();
    
    const parsedDate = `${new Date().toLocaleDateString().replaceAll('/', '-')}_${new Date().toLocaleTimeString().replaceAll(':', '-')}`
    const outputFile = `${databasePath()}/Sigmund_backup_${parsedDate}.zip`

    zip.addLocalFile(`${databasePath()}/database.db`)
    zip.writeZip(outputFile);
    ipc.send(
      'backup_create_success',
      {
        dados: {
          outputPath: databasePath(),
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
 * Dispara o sinal para abrir a caixa de diálogo de recuperação do banco
 */
const abrirDialogDeRecuperacao = () => {
  ipc.send(
    'backup_import_select',
    { 
      dados: {
        outputPath: databasePath(),
      }
    }
  )
}

/**
 * Recupera o arquivo de backup e apaga seu zip após a operação co sucesso
 * @param {Event} event 
 * @param {string} filePath Path do arquivo de backup
 */
const recoverBackup = (event, filePath) => {
  const zip = new AdmZip(filePath);
  try {
    zip.extractAllTo(databasePath(), true);
    ipc.send('backup_recovered_successfully', {
      dados: { zipFile: filePath },
    })
    alert('Dados recuperados com sucesso!')
  } catch (error) {
    alert('Houve algum problema ao recuperar os dados. Tente novamente.')
    console.warn(error)
  }
}

/**
 * Vincula ações aos botões
 */
const vincularAcoes = () => {
  document.querySelector(BOTOES.BACKUP).addEventListener('click', backup)

  document.querySelector(BOTOES.IMPORTAR).addEventListener('click', abrirDialogDeRecuperacao)

  ipc.on('backup_path_was_selected', recoverBackup)
}


window.addEventListener('DOMContentLoaded', async () => {
  vincularAcoes()
  document.getElementById('texto-local-backup').innerText = databasePath()
})
