<template>
  <v-container class="py-6">
    <h1>Manage Reports & Feedback</h1>
  <v-data-table :headers="headers" :items="reports" class="mt-4 feedback-table" item-key="id" hide-default-footer>
      <template #item.actions="{ item }">
        <v-btn size="small" color="primary">Mark as Read</v-btn>
        <v-btn size="small" color="ownerColor">Respond</v-btn>
        <v-btn size="small" color="lightBlush">Archive</v-btn>
      </template>
    </v-data-table>
  </v-container>
</template>

<script setup>
const headers = [
  { title: 'User', value: 'user' },
  { title: 'Type', value: 'type' },
  { title: 'Message', value: 'message' },
  { title: 'Actions', value: 'actions', sortable: false },
]
const reports = [
  { id: 1, user: 'Alice', type: 'Bug', message: 'App crashes on login.' },
  { id: 2, user: 'Bob', type: 'Suggestion', message: 'Add dark mode.' },
  { id: 3, user: 'Carol', type: 'Feedback', message: 'Great platform!' },
]
// ...existing code...
</script>

<style scoped>
.feedback-table >>> tbody tr {
  transition: background 0.2s;
}
.feedback-table >>> tbody tr:hover {
  background: #F6DED8;
}
.feedback-table >>> tbody tr.active-row {
  background: #ECA1A6;
}
h1 {
  font-family: 'Avenir', system-ui, sans-serif;
  font-weight: 700;
}
</style>
