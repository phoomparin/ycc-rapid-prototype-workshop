/* global Vue, vm, firebase */

vm = new Vue({
  el: "#app",
  data: {
    currentUser: null,
    table: {},
    submitting: false,
    userProfiles: {}
  },
  methods: {
    getName(userId) {
      const profile = (this.userProfiles || {})[userId]
      return profile ? profile.name : userId
    },
    async login() {
      let result = await login()
  
      if (!result) {
        alert('เข้าสู่ระบบไม่สำเร็จ กรุณาใส่ชื่อด้วย')
        return
      }
    },
    async renameMember() {
      const user = firebase.auth().currentUser;
      
      await promptSetName(user.uid, {isRenaming: true})
    },
    async setVote(entryId, vote) {
      const loginResult = await login()
      if (!loginResult) {
        return;
      }
      firebase
        .database()
        .ref("vote/entries")
        .child(entryId)
        .child('votes')
        .child(loginResult.user.uid)
        .set(vote);
    },
    getUserState(entryId, criterion) {
      return (this.table[entryId].votes || {})[this.currentUser] === criterion
        ? "1"
        : "0";
    },
    isMine(entryId) {
      return (this.table[entryId].user) === this.currentUser
    },
    isAdmin() {
      return !!this.admins[this.currentUser]
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

async function promptSetName(uid, {isRenaming} = {isRenaming: false}) {
  const nameRef = firebase
    .database()
    .ref("profile")
    .child(uid)
    .child("name");

  const nameSnapshot = await nameRef.once("value");
  let name = nameSnapshot.val();
  
  if (!name || isRenaming) {
    name = prompt("Your name");
    if (!name) return null;
    await nameRef.set(name);
  }
  
  return name
}

async function login() {
  if (!firebase.auth().currentUser) {
    await firebase.auth().signInAnonymously();
  }
  const user = firebase.auth().currentUser;
  
  let name = await promptSetName(user.uid)
  if (!name) return null

  return { user, name }
}

firebase
  .database()
  .ref("vote/entries")
  .on("value", snapshot => {
    vm.table = snapshot.val();
  });

firebase
  .database()
  .ref("profile")
  .on("value", snapshot => {
    vm.userProfiles = snapshot.val();
  });

firebase
  .auth()
  .onAuthStateChanged((user) => {
    vm.currentUser = user.uid
  })