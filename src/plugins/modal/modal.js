/**
 * Prepara o modal e vincula as ações básicas
 * @param {string} modalId Id do modal, sem #
 * @param {string} triggerButtonId Id do botão ativador do modal, sem #
 */
const setUpModal = (modalId, triggerButtonId) => {
    
    setUpStyles()

    try {
        modalId = modalId || 'myModal'
        triggerButtonId = triggerButtonId || 'myBtn'
    
        // Recuperar modal
        const modal = document.getElementById(modalId);
        if (modal === null) {
            throw Error('Elemento de modal não encontrado!')
        }
    
        // Botão que provocará a abertura do modal. Pode ou não existir, caso
        // não seja necessário um botão específico só pra abertura
        const btn = document.getElementById(triggerButtonId);
        if (btn != null) {
            btn.onclick = () => { modal.style.display = "block" }
        }

        // Ícone [X] no modal
        const span = document.getElementsByClassName("close")[0];
        // Fechar modal
        span.onclick = () => { modal.style.display = "none" }
    
        // Ao clicar fora do modal, fecha
        window.onclick = (event) => {
            if (event.target == modal) {
                modal.style.display = "none";
            }
        }
    } catch (erro) {
        console.warn('Não foi possível inicializar o modal. Erros: ', erro)
    }

}

/**
 * Adiciona na página os estilos css necessários para o modal
 * @return {undefined}
 */
const setUpStyles = () => {
    const styles = `
        /* The Modal (background) */
        .modal {
        display: none; /* Hidden by default */
        position: fixed; /* Stay in place */
        z-index: 2; /* Sit on top */
        padding-top: 9px; /* Location of the box */
        left: 0;
        top: 0;
        width: 100%; /* Full width */
        height: 100%; /* Full height */
        overflow: auto; /* Enable scroll if needed */
        background-color: rgb(0,0,0); /* Fallback color */
        background-color: rgba(0,0,0,0.4); /* Black w/ opacity */
        }

        /* Modal Content */
        .modal-content {
        background-color: #fefefe;
        margin: auto;
        padding: 20px;
        border: 1px solid #888;
        width: 80%;
        }

        /* The Close Button */
        .close {
        color: #aaaaaa;
        float: right;
        font-size: 28px;
        font-weight: bold;
        }

        .close:hover,
        .close:focus {
        color: #000;
        text-decoration: none;
        cursor: pointer;
        }
    `

    var styleSheet = document.createElement("style")
    styleSheet.innerText = styles
    document.head.appendChild(styleSheet)
}

/**
 * Abre o modal inicializado
 * @param {string} triggerButtonId Nome do ID do botão que ativa o modal, sem "#"
 * @return {undefined}
 */
const openModal = (triggerButtonId) => {
    triggerButtonId = triggerButtonId || 'myBtn'
    document.getElementById(triggerButtonId).click()
}

/**
 * Fecha o modal inicializado
 * @param {string} modalId Nome do modal, sem "#"
 * @return {undefined}
 */
const closeModal = (modalId) => {
    modalId = modalId || 'myModal'
    document.querySelector(`#${modalId} .close`).click()
}

module.exports = {
    setUpModal,
    openModal,
    closeModal,
}