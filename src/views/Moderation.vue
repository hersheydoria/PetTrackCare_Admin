<template>
  <v-container class="py-6">
    <h1>Community Post Moderation</h1>
    <v-row class="mb-4">
      <v-col cols="12" sm="6" md="4">
        <v-select :items="filters" label="Filter" v-model="selectedFilter" />
      </v-col>
    </v-row>
    <v-data-table :headers="headers" :items="filteredPosts" class="mt-4 moderation-table" item-key="id" hide-default-footer>
      <template #item.actions="{ item }">
        <v-btn size="small" color="deepRed">Hide</v-btn>
        <v-btn size="small" color="lightBlush">Delete</v-btn>
      </template>
    </v-data-table>
  </v-container>
</template>

<script setup>
import { ref, computed } from 'vue'
const filters = ['All', 'Flagged', 'Reported']
const selectedFilter = ref('All')
const headers = [
  { title: 'Preview', value: 'preview' },
  { title: 'Date', value: 'date' },
  { title: 'Status', value: 'status' },
  { title: 'Actions', value: 'actions', sortable: false },
]
const posts = [
  { id: 1, preview: 'Lost dog near park', date: '2025-08-20', status: 'Flagged' },
  { id: 2, preview: 'Found cat on Main St.', date: '2025-08-21', status: 'Reported' },
  { id: 3, preview: 'Dog adoption event', date: '2025-08-22', status: 'Normal' },
]
const filteredPosts = computed(() => {
  if (selectedFilter.value === 'All') return posts
  return posts.filter(p => p.status === selectedFilter.value)
})
</script>

<style scoped>
.moderation-table >>> tbody tr {
  transition: background 0.2s;
}
.moderation-table >>> tbody tr:hover {
  background: #F6DED8;
}
.moderation-table >>> tbody tr.active-row {
  background: #ECA1A6;
}
h1 {
  font-family: 'Avenir', system-ui, sans-serif;
  font-weight: 700;
}
</style>
