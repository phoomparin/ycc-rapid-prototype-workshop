/* global Vue, vm, firebase */

const pad = n => String(n).padStart(2, 0)

function formatHMS(now) {
  let HH = pad(now.getHours());
  let MM = pad(now.getMinutes());
  let SS = pad(now.getSeconds());
  
  return `${HH}:${MM}:${SS}`;
}

function getRemaining(diff) {
  diff /= 1000
  
  let HH = Math.floor(diff / 3600)
  diff = diff - HH * 3600
  
  let MM = Math.floor(diff / 60)
  diff = diff - MM * 60
  
  let SS = Math.floor(diff)
  
  return `${pad(HH)}:${pad(MM)}:${pad(SS)}`
}


vm = new Vue({
  el: "#app",
  data: {
    currentTime: new Date(),
    targetTime: new Date(),
    logs: {},
    remainingTime: ''
  },
  methods: {
    format(time) {
      return formatHMS(time)
    },
    setTime() {
      const answer = prompt('Enter finish time', this.format(this.targetTime))
      if (!answer) {
        return
      }
      const [h = 0, m = 0, s = 0] = answer.split(':').map(x => +x || 0)
      const targetTime = new Date()
      targetTime.setHours(h)
      targetTime.setMinutes(m)
      targetTime.setSeconds(s)
      targetTime.setMilliseconds(0)
      if (targetTime < Date.now()) {
        targetTime.setTime(targetTime.getTime() + 24 * 60 * 60 * 1000)
      }
      firebase.database().ref('countdown/target').set(targetTime.toJSON())
      firebase.database().ref('countdown/log').push({
        time: new Date().toJSON(),
        message: 'Set target time to ' + this.format(targetTime)
      })
    },
    extendTime() {
      
    },
    markAsFinished() {
      
    },
    updateRemainingTime() {
      let diff = this.targetTime - this.currentTime
      
      this.remainingTime = getRemaining(diff)
    }
  }
});

firebase.database().ref('countdown/target').on('value', (snapshot) => {
  vm.targetTime = new Date(snapshot.val())
})

firebase.database().ref('countdown/log').on('value', (snapshot) => {
  vm.logs = snapshot.val()
})

window.addEventListener("DOMContentLoaded", () => {
  let timer = setInterval(() => {
    const now = new Date();

    vm.currentTime = new Date();
    vm.updateRemainingTime();
  }, 1000);
});
