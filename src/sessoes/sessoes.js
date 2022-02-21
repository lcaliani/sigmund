let ipc = require('electron').ipcRenderer;
const modal = require('../plugins/modal/modal')

document.addEventListener('DOMContentLoaded', function() {
  var calendarEl = document.getElementById('calendar');
  var calendar = new FullCalendar.Calendar(calendarEl, {
    // layout
    initialView: 'timeGridWeek',
    allDaySlot: false,
    nowIndicator: true,
    buttonIcons: {
      prev: 'chevron-left',
      next: 'chevron-right',
    },
    buttonText: {
      today: 'Hoje',
    },
    height: 585,


    // Idioma
    locale: 'pt-br',

    eventTimeFormat: { // like '14:30:00'
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    },
    events: [
      {
        title: 'Leonardo Ruellas',
        start: '2022-02-16T14:50:00',
        end: '2022-02-16T15:40:00',
        // extendedProps: {
        //   status: 'done'
        // }
      },
      {
        title: 'Carl Sagan',
        start: '2022-02-16T15:40:00',
        backgroundColor: 'green',
        borderColor: 'green'
      }
    ],
    eventDidMount: function(info) {
      // if (info.event.extendedProps.status === 'done') {

      //   // Change background color of row
      //   info.el.style.backgroundColor = 'red';

      //   // Change color of dot marker
      //   var dotEl = info.el.getElementsByClassName('fc-event-dot')[0];
      //   if (dotEl) {
      //     dotEl.style.backgroundColor = 'white';
      //   }
      // }
    }
  });
  calendar.render();

  console.log(calendar)

  modal.setUpModal('modal-marcar-sessao', 'sessoes-adicionar-marcacao')
  document.querySelector('#sessoes-adicionar-marcacao').addEventListener('click', () => {
    // alert('Aqui será aberto um modal para o preenchimento da nova marcação. See: https://fullcalendar.io/docs/Calendar-addEvent')
    // calendar.addEvent({
    //     title: 'Um novo evento',
    //     start: '2022-02-21T14:50:00',
    //     end: '2022-02-21T15:40:00',
        // extendedProps: {
        //   status: 'done'
        // }
    //   }
    // )
  })
});





// }

