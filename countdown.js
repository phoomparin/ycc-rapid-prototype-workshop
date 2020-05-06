/* global Vue, vm, firebase */

let pad = num => (num < 10 ? "0" + num : num);

function formatHMS(now) {
  let HH = pad(now.getHours());
  let MM = pad(now.getMinutes());
  let SS = pad(now.getSeconds());
  
  return `${HH}:${MM}:${SS}`;
}

vm = new Vue({
  el: "#app",
  data: {
    currentTime: "...",
    targetTime: "..."
  },
  methods: {
    format(time) {
      return formatHMS(time)
    }
  }
});

firebase.database().ref('countdown/target').on('value', (snapshot) => {
  vm.targetTime = new Date(snapshot.val())
})

window.addEventListener("DOMContentLoaded", () => {
  let timer = setInterval(() => {
    const now = new Date();

    vm.currentTime = new Date();
  }, 1000);
});
