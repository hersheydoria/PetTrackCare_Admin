<template>
  <v-container class="py-8 px-6">
    <div class="feedback-header mb-8">
      <div>
        <h1 class="text-h3 font-weight-bold mb-2">Reports & Feedback</h1>
        <p class="text-subtitle-1 text-medium-emphasis">Review and respond to user feedback and reports</p>
      </div>
      <div class="d-flex align-center gap-3">
        <v-chip 
          color="info" 
          size="large"
          prepend-icon="mdi-message-alert"
          class="px-4"
        >
          {{ reports.length }} Total
        </v-chip>
        <v-chip 
          color="warning" 
          size="large"
          prepend-icon="mdi-circle-small"
          class="px-4"
        >
          {{ unreadCount }} Unread
        </v-chip>
      </div>
    </div>

    <v-card class="feedback-card" elevation="0">
      <v-tabs v-model="tab" class="feedback-tabs">
        <v-tab value="active" prepend-icon="mdi-inbox">
          <span class="ml-2">Active ({{ activeCount }})</span>
        </v-tab>
        <v-tab value="read" prepend-icon="mdi-check-circle">
          <span class="ml-2">Read ({{ readCount }})</span>
        </v-tab>
        <v-tab value="archived" prepend-icon="mdi-archive">
          <span class="ml-2">Archived ({{ archivedCount }})</span>
        </v-tab>
      </v-tabs>

      <v-data-table
        :headers="headers"
        :items="filteredReports"
        class="feedback-table"
        item-key="id"
        :items-per-page="10"
      >
        <template #item.user="{ item }">
          <div class="font-weight-medium">{{ item.user }}</div>
        </template>

        <template #item.message="{ item }">
          <div class="feedback-message-cell">
            <p class="text-body-2 mb-0">{{ truncateText(item.message, 80) }}</p>
            <v-tooltip v-if="item.message.length > 80" activator="parent" location="top">
              {{ item.message }}
            </v-tooltip>
          </div>
        </template>

        <template #item.is_read="{ item }">
          <v-chip 
            :color="item.is_read ? 'success' : 'warning'" 
            size="small"
            variant="tonal"
            :prepend-icon="item.is_read ? 'mdi-check-circle' : 'mdi-circle-small'"
          >
            {{ item.is_read ? 'Read' : 'Unread' }}
          </v-chip>
        </template>

        <template #item.actions="{ item }">
          <div class="action-buttons">
            <!-- Active tab buttons -->
            <v-btn
              v-if="tab === 'active' && !item.is_read"
              size="small"
              color="primary"
              variant="tonal"
              prepend-icon="mdi-check"
              @click="markAsRead(item.id)"
            >
              Read
            </v-btn>
            <v-btn
              v-if="tab === 'active'"
              size="small"
              color="deepRed"
              variant="tonal"
              prepend-icon="mdi-reply"
              @click="respondToFeedback(item)"
            >
              Respond
            </v-btn>
            <v-btn
              v-if="tab === 'active'"
              size="small"
              color="warning"
              variant="tonal"
              prepend-icon="mdi-archive"
              @click="archiveFeedback(item.id)"
            >
              Archive
            </v-btn>
            <!-- Read tab buttons -->
            <v-btn
              v-if="tab === 'read'"
              size="small"
              color="warning"
              variant="tonal"
              prepend-icon="mdi-circle-small"
              @click="markAsUnread(item.id)"
            >
              Unread
            </v-btn>
            <v-btn
              v-if="tab === 'read'"
              size="small"
              color="deepRed"
              variant="tonal"
              prepend-icon="mdi-reply"
              @click="respondToFeedback(item)"
            >
              Respond
            </v-btn>
            <v-btn
              v-if="tab === 'read'"
              size="small"
              color="warning"
              variant="tonal"
              prepend-icon="mdi-archive"
              @click="archiveFeedback(item.id)"
            >
              Archive
            </v-btn>
            <!-- Archived tab buttons -->
            <v-btn
              v-if="tab === 'archived' && !item.is_read"
              size="small"
              color="primary"
              variant="tonal"
              prepend-icon="mdi-check"
              @click="markAsRead(item.id)"
            >
              Read
            </v-btn>
            <v-btn
              v-if="tab === 'archived'"
              size="small"
              color="deepRed"
              variant="tonal"
              prepend-icon="mdi-reply"
              @click="respondToFeedback(item)"
            >
              Respond
            </v-btn>
            <v-btn
              v-if="tab === 'archived'"
              size="small"
              color="success"
              variant="tonal"
              prepend-icon="mdi-undo"
              @click="unarchiveFeedback(item.id)"
            >
              Unarchive
            </v-btn>
          </div>
        </template>

        <template #no-data>
          <div class="text-center py-12">
            <v-icon size="80" color="primary" class="mb-4">mdi-inbox-outline</v-icon>
            <h3 class="text-h6 mb-2">No Feedback Found</h3>
            <p class="text-body-2 text-medium-emphasis">No reports or feedback to display</p>
          </div>
        </template>
      </v-data-table>
    </v-card>

    <!-- Response Dialog -->
    <v-dialog v-model="responseDialog" max-width="600">
      <v-card class="pa-6">
        <v-card-title class="d-flex align-center pa-0 mb-6">
          <v-icon color="primary" class="mr-3" size="large">mdi-reply</v-icon>
          <div>
            <span class="text-h6">Respond to Feedback</span>
            <div class="text-caption text-medium-emphasis">From: {{ currentFeedback?.user }}</div>
          </div>
        </v-card-title>
        
        <v-card class="bg-light-blue mb-6 pa-4" elevation="0">
          <p class="text-body-2 mb-0">
            <strong>Feedback:</strong> {{ currentFeedback?.message }}
          </p>
        </v-card>

        <v-textarea 
          v-model="responseMessage" 
          label="Your Response" 
          rows="5"
          density="comfortable"
          variant="outlined"
          placeholder="Type your response here..."
          class="mb-4"
        />
        
        <v-card-actions class="pa-0">
          <v-spacer></v-spacer>
          <v-btn 
            color="grey" 
            variant="text"
            @click="responseDialog = false"
          >
            Cancel
          </v-btn>
          <v-btn 
            color="primary" 
            variant="flat"
            prepend-icon="mdi-send"
            @click="sendResponse"
            :loading="sendingResponse"
          >
            Send Response
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Success Snackbar -->
    <v-snackbar
      v-model="snackbar"
      :color="snackbarColor"
      :timeout="3000"
      location="top"
    >
      <div class="d-flex align-center">
        <v-icon class="mr-2">{{ snackbarIcon }}</v-icon>
        {{ snackbarText }}
      </div>
    </v-snackbar>
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { supabase } from '../supabase.js'

const headers = [
  { title: 'User', value: 'user', width: '150px' },
  { title: 'Message', value: 'message', width: '300px' },
  { title: 'Status', value: 'is_read', width: '120px' },
  { title: 'Actions', value: 'actions', sortable: false, width: '350px' },
]

const reports = ref([])
const tab = ref('active')
const responseDialog = ref(false)
const responseMessage = ref('')
const currentFeedback = ref(null)
const sendingResponse = ref(false)
const snackbar = ref(false)
const snackbarText = ref('')
const snackbarColor = ref('success')
const snackbarIcon = ref('mdi-check-circle')

const activeCount = computed(() => reports.value.filter(r => !r.archived && !r.is_read).length)
const readCount = computed(() => reports.value.filter(r => !r.archived && r.is_read).length)
const archivedCount = computed(() => reports.value.filter(r => r.archived).length)
const unreadCount = computed(() => reports.value.filter(r => !r.is_read).length)

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

function truncateText(text, maxLength) {
  if (!text) return ''
  return text.length > maxLength ? text.substring(0, maxLength) + '...' : text
}

function showSnackbar(text, color = 'success', icon = 'mdi-check-circle') {
  snackbarText.value = text
  snackbarColor.value = color
  snackbarIcon.value = icon
  snackbar.value = true
}

async function fetchReports() {
  try {
    const { data: feedbacks, error: feedbackError } = await supabase
      .from('feedback')
      .select('id, user_id, message, archived, is_read')
      .order('created_at', { ascending: false })
    
    if (feedbackError) {
      console.error('Error fetching feedback:', feedbackError)
      showSnackbar('Failed to load feedback', 'error', 'mdi-alert-circle')
      reports.value = []
      return
    }

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
      user_id: r.user_id,
      user: usersMap[r.user_id] ?? 'Unknown',
      message: r.message,
      archived: r.archived === true || r.archived === 'true',
      is_read: r.is_read === true || r.is_read === 'true'
    }))
  } catch (err) {
    console.error('Unexpected error:', err)
    showSnackbar('An unexpected error occurred', 'error', 'mdi-alert-circle')
    reports.value = []
  }
}

async function archiveFeedback(id) {
  const { error } = await supabase
    .from('feedback')
    .update({ archived: true })
    .eq('id', id)
  
  if (error) {
    showSnackbar('Failed to archive feedback', 'error', 'mdi-alert-circle')
  } else {
    showSnackbar('Feedback archived successfully', 'success', 'mdi-check-circle')
  }
  await fetchReports()
}

async function unarchiveFeedback(id) {
  const { error } = await supabase
    .from('feedback')
    .update({ archived: false })
    .eq('id', id)
  
  if (error) {
    showSnackbar('Failed to unarchive feedback', 'error', 'mdi-alert-circle')
  } else {
    showSnackbar('Feedback unarchived successfully', 'success', 'mdi-check-circle')
  }
  await fetchReports()
}

async function markAsRead(id) {
  const { error } = await supabase
    .from('feedback')
    .update({ is_read: true })
    .eq('id', id)
  
  if (error) {
    showSnackbar('Failed to mark as read', 'error', 'mdi-alert-circle')
  }
  await fetchReports()
}

async function markAsUnread(id) {
  const { error } = await supabase
    .from('feedback')
    .update({ is_read: false })
    .eq('id', id)
  
  if (error) {
    showSnackbar('Failed to mark as unread', 'error', 'mdi-alert-circle')
  }
  await fetchReports()
}

function respondToFeedback(item) {
  currentFeedback.value = item
  responseMessage.value = ''
  responseDialog.value = true
}

async function sendResponse() {
  if (!currentFeedback.value || !responseMessage.value.trim()) {
    showSnackbar('Please enter a response', 'warning', 'mdi-alert-circle')
    return
  }

  sendingResponse.value = true
  
  try {
    console.log('Sending email for user_id:', currentFeedback.value.user_id)
    
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

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${responseText}`)
    }

    const data = JSON.parse(responseText)
    console.log('Parsed response:', data)

    if (data?.success && !data?.data?.error) {
      showSnackbar('Response sent successfully!', 'success', 'mdi-check-circle')
      // Mark as read after sending response
      await markAsRead(currentFeedback.value.id)
    } else {
      const errorMsg = data?.data?.error?.message || data?.error || 'Unknown error'
      showSnackbar('Failed to send response: ' + errorMsg, 'error', 'mdi-alert-circle')
    }

    responseDialog.value = false
    responseMessage.value = ''
  } catch (error) {
    console.error('Error sending response:', error)
    showSnackbar('Failed to send response: ' + error.message, 'error', 'mdi-alert-circle')
  } finally {
    sendingResponse.value = false
  }
}

onMounted(fetchReports)
</script>

<style scoped>
.feedback-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
}

.feedback-card {
  border-radius: 16px;
  border: 1px solid rgba(0, 0, 0, 0.06);
  overflow: hidden;
}

.feedback-tabs {
  background: linear-gradient(145deg, #fafafa 0%, #f5f5f5 100%);
}

.feedback-table {
  background: transparent;
}

.feedback-table :deep(thead) {
  background: linear-gradient(145deg, #fafafa 0%, #f5f5f5 100%);
}

.feedback-table :deep(thead th) {
  font-weight: 600 !important;
  color: #424242 !important;
  text-transform: uppercase;
  font-size: 0.75rem;
  letter-spacing: 0.05em;
}

.feedback-table :deep(tbody tr) {
  transition: all 0.2s ease;
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
}

.feedback-table :deep(tbody tr:hover) {
  background: #FFF3F0 !important;
  transform: scale(1.01);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.feedback-table :deep(tbody td) {
  padding: 16px 12px !important;
}

.feedback-message-cell {
  max-width: 300px;
  cursor: help;
}

.action-buttons {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.bg-light-blue {
  background: #e3f2fd !important;
}

h1 {
  font-family: 'Avenir', system-ui, sans-serif;
  font-weight: 700;
  letter-spacing: -0.02em;
}

@media (max-width: 960px) {
  .feedback-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .action-buttons {
    flex-direction: column;
    width: 100%;
  }

  .action-buttons > * {
    width: 100%;
  }
}

:deep(.v-table__wrapper) {
  overflow: hidden;
}
</style>