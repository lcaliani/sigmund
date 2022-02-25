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
        this._time = ''
    }

    /** @returns {string} Data no formato `yyyy-MM-dd` | ex: 2022-12-06 */
    get date() {
      let month = this.fullDate.getMonth() + 1
      month = this.addLeadingZero(month)
      
      return `${this.fullDate.getFullYear()}-${month}-${this.fullDate.getDate()}`
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