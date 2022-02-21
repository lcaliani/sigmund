const setUpModal = (modalId, triggerButtonId) => {

    modalName = modalId || 'myModal'
    triggerButtonName = triggerButtonId || 'myBtn'

    // Recuperar modal e botão disparador
    const modal = document.getElementById(modalId);
    const btn = document.getElementById(triggerButtonId);

    // Ícone [X] no modal
    const span = document.getElementsByClassName("close")[0];

    // When the user clicks the button, open the modal 
    btn.onclick = () => { modal.style.display = "block" }

    // When the user clicks on <span> (x), close the modal
    span.onclick = () => { modal.style.display = "none" }

    // When the user clicks anywhere outside of the modal, close it
    window.onclick = (event) => {
        if (event.target == modal) {
            modal.style.display = "none";
        }
    }
}

module.exports = {
    setUpModal,
}