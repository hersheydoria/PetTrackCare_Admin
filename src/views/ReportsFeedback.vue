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
    // Get names from users table
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
    user_id: r.user_id,
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
  
  try {
    console.log('Sending email for user_id:', currentFeedback.value.user_id)
    
    // Send email to user using Supabase Edge Function
    const response = await fetch(`${supabase.supabaseUrl}/functions/v1/send-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabase.supabaseKey}`,
      },
      body: JSON.stringify({
        user_id: currentFeedback.value.user_id,
        subject: 'Response to Your Feedback - PetTrackCare',
        html: `
          <h2>Thank you for your feedback!</h2>
          <p>Dear ${currentFeedback.value.user},</p>
          <p>We have reviewed your feedback and wanted to respond:</p>
          <div style="background: #f5f5f5; padding: 15px; margin: 10px 0; border-radius: 5px;">
            <strong>Your feedback:</strong><br>
            ${currentFeedback.value.message}
          </div>
          <div style="background: #e3f2fd; padding: 15px; margin: 10px 0; border-radius: 5px;">
            <strong>Our response:</strong><br>
            ${responseMessage.value}
          </div>
          <p>Thank you for helping us improve PetTrackCare!</p>
          <p>Best regards,<br>PetTrackCare Admin Team</p>
        `
      })
    })

    const responseText = await response.text()
    console.log('Raw response:', responseText)
    console.log('Response status:', response.status)

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${responseText}`)
    }

    const data = JSON.parse(responseText)
    console.log('Parsed response:', data)

    if (data?.success && !data?.data?.error) {
      alert('Response sent successfully via email!')
    } else {
      const errorMsg = data?.data?.error?.message || data?.error || 'Unknown error'
      alert('Email sending failed: ' + errorMsg)
    }

    responseDialog.value = false
    responseMessage.value = ''
  } catch (error) {
    console.error('Error sending response:', error)
    alert('Failed to send response: ' + error.message)
  }
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