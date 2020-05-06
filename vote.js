/* global Vue, vm, firebase */

const roomId = new URLSearchParams(location.search).get('room') || 'default'
const roomRef = firebase.database().ref('vote/rooms').child(roomId)

vm = new Vue({
  el: "#app",
  data: {
    roomId: roomId,
    currentUser: null,
    table: {},
    submitting: false,
    userProfiles: {},
    admins: {},
    roomName: roomId,
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
    async newRoom() {
      let result = await login()
      if (!result) {
        return
      }
      const name = prompt('ชื่อห้อง')
      if (!name) {
        return
      }
      const {key} = await firebase.database().ref('vote/rooms').push({
        name,
        admins: {
          [result.user.uid]: true
        }
      })
      location.search = `?room=${key}`
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
      roomRef.child('entries')
        .child(entryId)
        .child('votes')
        .child(loginResult.user.uid)
        .transaction(x => {
          return x === vote ? null : vote
        });
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
      return this.admins && !!this.admins[this.currentUser]
    },
    voteCount(entryId, criterion) {
      return Object.values(this.table[entryId].votes || {}).filter(
        v => v === criterion
      ).length;
    },
    voteNames(entryId, criterion) {
      return Object.entries(this.table[entryId].votes || {}).filter(
        ([k, v]) => v === criterion
      ).map(([k,v])=>this.getName(k));
    },
    edit(entryId) {
      const text = prompt("Your proposal", this.table[entryId].detail);
      const textRef = roomRef.child('entries')
        .child(entryId)
        .child('detail')
      if (!text) {
        return;
      }
      textRef.set(text);
    },
    toggleRetract(entryId) {
      let entryRef = roomRef.child('entries')
        .child(entryId)
        .child('available')
      
      entryRef.once('value', value => {
        entryRef.set(!value.val())
      })
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
        roomRef.child('entries')
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

roomRef.child('entries')
  .on("value", snapshot => {
    vm.table = snapshot.val();
  });

roomRef.child('admins')
  .on("value", snapshot => {
    vm.admins = snapshot.val();
  });

roomRef.child('name')
  .on("value", snapshot => {
    vm.roomName = snapshot.val();
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