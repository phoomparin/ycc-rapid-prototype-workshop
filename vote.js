/* global Vue, vm, firebase */

vm = new Vue({
  el: "#app",
  data: {
    currentUser: "user1",
    table: {},
    submitting: false
  },
  methods: {
    async login() {
      let result = await login()
  
      if (!result) {
        alert('')
      }
    },
    getUserState(entryId, criterion) {
      return (this.table[entryId].votes || {})[this.currentUser] === criterion
        ? "1"
        : "0";
    },
    voteCount(entryId, criterion) {
      return Object.values(this.table[entryId].votes || {}).filter(
        v => v === criterion
      ).length;
    },
    async submit() {
      this.submitting = true;
      try {
        const loginResult = await login()
        if (!loginResult) {
          return;
        }
        const {name,user} = loginResult
        const text = prompt("Your proposal");
        if (!text) {
          return;
        }
        firebase
          .database()
          .ref("vote/entries")
          .push({
            added: new Date().toJSON(),
            user: user.uid,
            detail: text,
            available: true
          });
        firebase
          .database()
          .ref("vote/log")
          .push({
            time: new Date().toJSON(),
            message: `${name} proposed: ${text}`
          });
      } finally {
        this.submitting = false;
      }
    }
  }
});

async function login() {
  if (!firebase.auth().currentUser) {
    await firebase.auth().signInAnonymously();
  }
  const user = firebase.auth().currentUser;
  const nameRef = firebase
    .database()
    .ref("profile")
    .child(user.uid)
    .child("name");
  const nameSnapshot = await nameRef.once("value");
  let name = nameSnapshot.val();
  if (!name) {
    name = prompt("Your name");
    if (!name) {
      return null;
    }
    await nameRef.set(name);
  }
  return { user, name }
}

firebase
  .database()
  .ref("vote/entries")
  .on("value", snapshot => {
    vm.table = snapshot.val();
  });
