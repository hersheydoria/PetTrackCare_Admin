<template>
  <v-container class="py-6">
    <h1>Manage Reports & Feedback</h1>
    <v-data-table :headers="headers" :items="reports" class="mt-4 feedback-table" item-key="id" hide-default-footer>
      <template #item.actions="{ item }">
        <v-btn size="small" color="primary" class="action-btn">Mark as Read</v-btn>
        <v-btn size="small" color="ownerColor" class="action-btn">Respond</v-btn>
        <v-btn size="small" color="lightBlush" class="action-btn">Archive</v-btn>
      </template>
    </v-data-table>
  </v-container>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from '../supabase.js'

const headers = [
  { title: 'User', value: 'user' },
  { title: 'Type', value: 'type' },
  { title: 'Message', value: 'message' },
  { title: 'Actions', value: 'actions', sortable: false },
]

const reports = ref([])

async function fetchReports() {
  // Fetch reports/feedback and join with users for name
  const { data, error } = await supabase
    .from('reports_feedback')
    .select('id, user_id, type, message, users(name)')
  reports.value = (data || []).map(r => ({
    id: r.id,
    user: r.users?.name ?? 'Unknown',
    type: r.type,
    message: r.message
  }))
}

onMounted(fetchReports)
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
.action-btn {
  margin-right: 8px;
}
.action-btn:last-child {
  margin-right: 0;
}
h1 {
  font-family: 'Avenir', system-ui, sans-serif;
  font-weight: 700;
}
</style>
