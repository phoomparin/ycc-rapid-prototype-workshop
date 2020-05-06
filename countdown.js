console.log("hi");

window.addEventListener('DOMContentLoaded', () => {
  let currentTime = document.querySelector('#current-time')
  
  let timer = setInterval(() => {
    const now = new Date()
    
    let pad = num => num < 10 ? '0' + num : num
    let HH = pad(now.getHours())
    let MM = pad(now.getMinutes())
    let SS = pad(now.getSeconds())
  
    currentTime.textContent = `${HH}:${MM}:${SS}`
  }, 1000)
})
