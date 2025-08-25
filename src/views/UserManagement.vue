<template>
  <v-container class="py-6">
    <h1>User Account Management</h1>
  <v-data-table :headers="headers" :items="users" class="mt-4 user-table" item-key="id" hide-default-footer>
      <template #item.actions="{ item }">
        <v-btn size="small" color="primary">Edit</v-btn>
        <v-btn size="small" color="sitterColor">Deactivate</v-btn>
        <v-btn size="small" color="deepRed">Delete</v-btn>
      </template>
    </v-data-table>
  </v-container>
</template>

<script setup>
const headers = [
  { title: 'Name', value: 'name' },
  { title: 'Role', value: 'role' },
  { title: 'Status', value: 'status' },
  { title: 'Actions', value: 'actions', sortable: false },
]
const users = [
  { id: 1, name: 'Alice', role: 'Owner', status: 'Active' },
  { id: 2, name: 'Bob', role: 'Sitter', status: 'Banned' },
  { id: 3, name: 'Carol', role: 'Owner', status: 'Active' },
]
// ...existing code...
</script>

<style scoped>
.user-table >>> tbody tr {
  transition: background 0.2s;
}
.user-table >>> tbody tr:hover {
  background: #F6DED8;
}
.user-table >>> tbody tr.active-row {
  background: #ECA1A6;
}
h1 {
  font-family: 'Avenir', system-ui, sans-serif;
  font-weight: 700;
}
</style>
