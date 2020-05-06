/* global Vue, vm, firebase */


vm = new Vue({
  el: "#app",
  data: {
    currentUser: 'user1',
    table: {
      entry1: {
        user: 'Jabont 1',
        detail: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus enim magna, pellentesque non',
        votes: {
          user2: 'confirm',
          user3: 'concern',
        },
        available: true,
      },
      entry2: {
        user: 'Th 1',
        detail: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus enim magna, pellentesque non',
        votes: {
          user1: 'confirm',
          user3: 'concern',
        },
        available: true,
      },
      entry3: {
        user: 'Poom 1',
        detail: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus enim magna, pellentesque non',
        votes: {
          user2: 'confirm',
          user1: 'concern',
        },
        available: true,
      }
      // TODO: add entry2, entry3
    }
  },
  methods: {
    getUserState(entryId, criterion) {
      rety
    },
    voteCount(entryId, criterion) {
      
    }
  }
});