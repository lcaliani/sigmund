let ipcRenderer = require('electron').ipcRenderer;

ipcRenderer.on('dados_enviados_do_paciente', (evento, dados) => {
    console.log('opa, recebi.', dados) 
  })