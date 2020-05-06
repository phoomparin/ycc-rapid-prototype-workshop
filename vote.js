/* global Vue, vm, firebase */


vm = new Vue({
  el: "#app",
  data: {
    currentUser: 'user1',
    table: {}
  },
  methods: {
    getUserState(entryId, criterion) {
      return (this.table[entryId].votes || {})[this.currentUser] === criterion ? '1' : '0'
    },
    voteCount(entryId, criterion) {
      return Object.values(this.table[entryId].votes || {}).filter(v => v === criterion).length
    },
    async submit() {
      if (!firebase.auth().currentUser) {
        await firebase.auth().signInAnonymously()
      }
      const user = firebase.auth().currentUser
      const nameRef = firebase.database().ref('profile').child(user.uid).child('name')
      const nameSnapshot = await nameRef.once('value')
      if (!)
    }
  }
});

firebase.database().ref('vote/entries').on('value', (snapshot) => {
  vm.table = snapshot.val()
})

