/* global Vue, vm, firebase */

const pad = (n) => String(n).padStart(2, 0)

function formatHMS(now) {
  let HH = pad(now.getHours())
  let MM = pad(now.getMinutes())
  let SS = pad(now.getSeconds())

  return `${HH}:${MM}:${SS}`
}

function getRemaining(diff) {
  diff /= 1000

  let HH = Math.floor(diff / 3600)
  diff = diff - HH * 3600

  let MM = Math.floor(diff / 60)
  diff = diff - MM * 60

  let SS = Math.floor(diff)

  if (HH < 0) return '00:00:00'

  return `${pad(HH)}:${pad(MM)}:${pad(SS)}`
}

function reverseOrder(obj) {
  return Object.values(obj).sort((a, b) => new Date(b.time) - new Date(a.time))
}

vm = new Vue({
  el: '#app',
  data: {
    currentTime: new Date(),
    targetTime: new Date(),
    logs: {},
    remainingTime: '00:00:00',
    checkpointMinutes: [0, 1, 3, 5, 10, 20],
    flashDuration: 10000, // ms
    isFlashTimer: false,
  },
  methods: {
    format(time) {
      return formatHMS(time instanceof Date ? time : new Date(time))
    },
    setTime() {
      const answer = prompt('Enter finish time', this.format(this.targetTime))
      if (!answer) {
        return
      }
      const [h = 0, m = 0, s = 0] = answer.split(':').map((x) => +x || 0)
      const targetTime = new Date()
      targetTime.setHours(h)
      targetTime.setMinutes(m)
      targetTime.setSeconds(s)
      targetTime.setMilliseconds(0)
      if (targetTime < Date.now()) {
        targetTime.setTime(targetTime.getTime() + 24 * 60 * 60 * 1000)
      }
      firebase.database().ref('countdown/target').set(targetTime.toJSON())
      firebase
        .database()
        .ref('countdown/log')
        .push({
          time: new Date().toJSON(),
          message: 'Set target time to ' + this.format(targetTime),
        })
    },
    extendTime() {
      const answer = prompt('How many minutes to extend?', 5)
      if (!answer) return

      let minutes = Math.max(Number(answer), 1)

      const targetTime = new Date(
        this.targetTime.valueOf() + 1000 * 60 * minutes
      )

      firebase.database().ref('countdown/target').set(targetTime.toJSON())
      firebase
        .database()
        .ref('countdown/log')
        .push({
          time: new Date().toJSON(),
          message: `Extend by ${minutes} minutes`,
        })
    },
    markAsFinished() {
      firebase.database().ref('countdown/log').push({
        time: new Date().toJSON(),
        message: `Marked this session as finished.`,
      })
    },
    updateRemainingTime() {
      let diff = this.targetTime - this.currentTime

      this.remainingTime = getRemaining(diff)
    },
  },
  watch: {
    remainingTime(newVal) {
      const remainingMins = parseInt(newVal.split(':')[1])
      const remainingSecs = parseInt(newVal.split(':')[2])
      const isCheckpointMinute =
        this.checkpointMinutes.indexOf(remainingMins) > 0 && remainingSecs === 0
      if (isCheckpointMinute) {
        this.isFlashTimer = true
        setTimeout(() => {
          this.isFlashTimer = false
        }, this.flashDuration)
      }
    },
  },
})

firebase
  .database()
  .ref('countdown/target')
  .on('value', (snapshot) => {
    vm.targetTime = new Date(snapshot.val())
  })

firebase
  .database()
  .ref('countdown/log')
  .orderByChild('time')
  .on('value', (snapshot) => {
    vm.logs = reverseOrder(snapshot.val())
  })

window.addEventListener('DOMContentLoaded', () => {
  let timer = setInterval(() => {
    const now = new Date()

    vm.currentTime = new Date()
    vm.updateRemainingTime()
  }, 1000)
})
