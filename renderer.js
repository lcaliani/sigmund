let ipc = require('electron').ipcRenderer;

window.onload = () => {
    document.querySelector('#botao-prontuarios-e-anamnese').addEventListener('click', () => {
      console.log('Abrindo tela de prontuário')
      ipc.send(
        'abrir_janela_prontuarios_e_anamnese',
        {
          'dados': {}
        }
      )
    })

    document.querySelector('#botao-sessoes').addEventListener('click', () => {
      console.log('Abrindo tela de sessoes')
      ipc.send(
        'abrir_janela_sessoes',
        {
          'dados': {}
        }
      )
    })
}

