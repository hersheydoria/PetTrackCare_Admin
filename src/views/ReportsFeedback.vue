<template>
  <v-container class="py-6">
    <h1>Manage Reports & Feedback</h1>
    <v-tabs v-model="tab" class="mb-4">
      <v-tab value="active">Active</v-tab>
      <v-tab value="read">Read</v-tab>
      <v-tab value="archived">Archived</v-tab>
    </v-tabs>
    <v-data-table
      :headers="headers"
      :items="filteredReports"
      class="mt-4 feedback-table"
      item-key="id"
      hide-default-footer
    >
      <template #item.actions="{ item }">
        <!-- Active tab buttons -->
        <v-btn
          v-if="tab === 'active' && !item.is_read"
          size="small"
          color="primary"
          class="action-btn"
          @click="markAsRead(item.id)"
        >Mark as Read</v-btn>
        <v-btn
          v-if="tab === 'active'"
          size="small"
          color="ownerColor"
          class="action-btn"
          @click="respondToFeedback(item)"
        >Respond</v-btn>
        <v-btn
          v-if="tab === 'active'"
          size="small"
          color="lightBlush"
          class="action-btn"
          @click="archiveFeedback(item.id)"
        >Archive</v-btn>
        <!-- Read tab buttons -->
        <v-btn
          v-if="tab === 'read'"
          size="small"
          color="warning"
          class="action-btn"
          @click="markAsUnread(item.id)"
        >Mark as Unread</v-btn>
        <v-btn
          v-if="tab === 'read'"
          size="small"
          color="ownerColor"
          class="action-btn"
          @click="respondToFeedback(item)"
        >Respond</v-btn>
        <v-btn
          v-if="tab === 'read'"
          size="small"
          color="lightBlush"
          class="action-btn"
          @click="archiveFeedback(item.id)"
        >Archive</v-btn>
        <!-- Archived tab buttons -->
        <v-btn
          v-if="tab === 'archived' && !item.is_read"
          size="small"
          color="primary"
          class="action-btn"
          @click="markAsRead(item.id)"
        >Mark as Read</v-btn>
        <v-btn
          v-if="tab === 'archived'"
          size="small"
          color="ownerColor"
          class="action-btn"
          @click="respondToFeedback(item)"
        >Respond</v-btn>
        <v-btn
          v-if="tab === 'archived'"
          size="small"
          color="success"
          class="action-btn"
          @click="unarchiveFeedback(item.id)"
        >Unarchive</v-btn>
      </template>
    </v-data-table>
    <v-dialog v-model="responseDialog" max-width="400">
      <v-card>
        <v-card-title>Respond to Feedback</v-card-title>
        <v-card-text>
          <v-textarea v-model="responseMessage" label="Response" rows="4" />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn color="primary" @click="sendResponse">Send</v-btn>
          <v-btn color="grey" @click="responseDialog = false">Cancel</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { supabase } from '../supabase.js'

const headers = [
  { title: 'User', value: 'user' },
  { title: 'Message', value: 'message' },
  { title: 'Read', value: 'is_read' },
  { title: 'Actions', value: 'actions', sortable: false },
]

const reports = ref([])
const tab = ref('active')
const responseDialog = ref(false)
const responseMessage = ref('')
const currentFeedback = ref(null)

const filteredReports = computed(() => {
  if (tab.value === 'active') {
    return reports.value.filter(r => !r.archived && !r.is_read)
  }
  if (tab.value === 'read') {
    return reports.value.filter(r => !r.archived && r.is_read)
  }
  if (tab.value === 'archived') {
    return reports.value.filter(r => r.archived)
  }
  return []
})

async function fetchReports() {
  // Fetch feedbacks
  const { data: feedbacks, error: feedbackError } = await supabase
    .from('feedback')
    .select('id, user_id, message, archived, is_read')
    .order('created_at', { ascending: false })
  if (feedbackError) {
    reports.value = []
    return
  }

  // Get unique user_ids
  const userIds = [...new Set(feedbacks.map(fb => fb.user_id).filter(Boolean))]
  let usersMap = {}
  if (userIds.length > 0) {
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, name')
      .in('id', userIds)
    if (!usersError && users) {
      usersMap = Object.fromEntries(users.map(u => [u.id, u.name]))
    }
  }

  reports.value = (feedbacks || []).map(r => ({
    id: r.id,
    user: usersMap[r.user_id] ?? 'Unknown',
    message: r.message,
    archived: r.archived === true || r.archived === 'true',
    is_read: r.is_read === true || r.is_read === 'true'
  }))
}

async function archiveFeedback(id) {
  await supabase
    .from('feedback')
    .update({ archived: true })
    .eq('id', id)
  await fetchReports()
}

async function unarchiveFeedback(id) {
  await supabase
    .from('feedback')
    .update({ archived: false })
    .eq('id', id)
  await fetchReports()
}

async function markAsRead(id) {
  await supabase
    .from('feedback')
    .update({ is_read: true })
    .eq('id', id)
  await fetchReports()
}

async function markAsUnread(id) {
  await supabase
    .from('feedback')
    .update({ is_read: false })
    .eq('id', id)
  await fetchReports()
}

function respondToFeedback(item) {
  currentFeedback.value = item
  responseDialog.value = true
}

async function sendResponse() {
  if (!currentFeedback.value) return
  await supabase
    .from('feedback_responses')
    .insert({ feedback_id: currentFeedback.value.id, message: responseMessage.value })
  responseDialog.value = false
  responseMessage.value = ''
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
