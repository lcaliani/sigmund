let ipc = require('electron').ipcRenderer;
// const bootstrap = require('bootstrap')

// const members = require('./src/Member/members')
// const tables = require('./src/Table/tables')
// const categories = require('./src/Category/categories')
// const products = require('./src/Product/products')
// const attendances = require('./src/Attendance/attendances')

window.onload = () => {


    document.querySelector('#botao-prontuarios-e-anamnese').addEventListener('click', () => {

      console.log('Abrindo tela de prontuário')
      ipc.send(
        'abrir_janela_prontuarios_e_anamnese',
        {
          'dados': {
            exemplo: 'tyeste'
          }
        }
      )
    })

    document.querySelector('#botao-sessoes').addEventListener('click', () => {

      console.log('Abrindo tela de sessoes')
      ipc.send(
        'abrir_janela_sessoes',
        {
          'dados': {
            exemplo: 'tyeste'
          }
        }
      )
    })

    // members.load()
    // tables.load()
    // categories.load()
    // products.load()
    // attendances.load()
}

