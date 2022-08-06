/**
 * Classe para auxílio de formatação de data e hora
 * @property {string} date
 * @property {string} time
 */
class DateHelper {
    /**
     * @param {string} fullDate Data timestamp
     */
    constructor(fullDate) {
        this.fullDate = new Date(fullDate)
        this._date = ''
        this._dateBR = ''
        this._time = ''
    }

    /** @returns {string} Data no formato `yyyy-MM-dd` | ex: 2022-12-06 */
    get date() {
      let month = this.fullDate.getMonth() + 1
      month = this.addLeadingZero(month)

      let day = this.fullDate.getDate()
      day = this.addLeadingZero(day)

      return `${this.fullDate.getFullYear()}-${month}-${day}`
    }

    /** @returns {string} Data no formato `dd-MM-yyyy` | ex: 06-12-2022 */
    get dateBR() {
        const day = this.addLeadingZero(this.fullDate.getDate())

        let month = this.fullDate.getMonth() + 1
        month = this.addLeadingZero(month)
        
        return `${day}/${month}/${this.fullDate.getFullYear()}`
    }

    /** @returns {string} Hora e minuto no formato `HH:mm` | ex: 07:08 */
    get time() {
        const hour = this.addLeadingZero(this.fullDate.getHours())
        const minute = this.addLeadingZero(this.fullDate.getMinutes())
        return `${hour}:${minute}`
    }

    /**
     * Adiciona o zero à esquerda se o valor for menor que 10
     * @param {int|float} value 
     * @returns {int|float}
     */
    addLeadingZero(value) {
        return value < 10 ? (`0${value}`) : value
    }
}

module.exports = DateHelper
