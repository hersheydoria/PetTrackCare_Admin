<template>
  <v-container class="py-8 px-6">
    <div class="moderation-header mb-8">
      <div>
        <h1 class="text-h3 font-weight-bold mb-2">Content Moderation</h1>
        <p class="text-subtitle-1 text-medium-emphasis">Review and manage reported content</p>
      </div>
      <div class="d-flex align-center gap-6">
        <v-chip 
          color="error" 
          size="large"
          prepend-icon="mdi-flag-variant"
          class="px-4"
        >
          {{ allReports.length }} Reports
        </v-chip>
        <v-btn
          color="primary"
          prepend-icon="mdi-refresh"
          variant="tonal"
          @click="fetchReports"
        >
          Refresh
        </v-btn>
      </div>
    </div>

    <v-card class="moderation-card" elevation="0">
      <v-data-table
        :headers="reportHeaders"
        :items="allReports"
        :items-per-page="10"
        class="moderation-table"
        item-key="id"
      >
        <template #item.post_type="{ item }">
          <v-chip 
            :color="getPostTypeColor(item.post_type)" 
            size="small"
            variant="flat"
          >
            {{ item.post_type || 'Unknown' }}
          </v-chip>
        </template>

        <template #item.post_content="{ item }">
          <div class="post-content-cell">
            <p class="text-body-2 mb-0">{{ truncateText(item.post_content, 60) }}</p>
            <v-tooltip v-if="item.post_content.length > 60" activator="parent" location="top">
              {{ item.post_content }}
            </v-tooltip>
          </div>
        </template>

        <template #item.user_name="{ item }">
          <div class="d-flex align-center">
            <v-avatar 
              :color="item.user_name === 'Anonymous' ? 'grey' : 'primary'" 
              size="32" 
              class="mr-2"
            >
              <v-icon color="white" size="small">
                {{ item.user_name === 'Anonymous' ? 'mdi-incognito' : 'mdi-account' }}
              </v-icon>
            </v-avatar>
            <span class="text-body-2">{{ item.user_name }}</span>
          </div>
        </template>

        <template #item.reason="{ item }">
          <v-chip 
            :color="getReasonColor(item.reason)" 
            size="small"
            variant="tonal"
            prepend-icon="mdi-alert-circle-outline"
          >
            {{ item.reason }}
          </v-chip>
        </template>

        <template #item.created_at="{ item }">
          <div class="d-flex align-center">
            <v-icon size="small" class="mr-1 text-medium-emphasis">mdi-clock-outline</v-icon>
            <span class="text-caption text-medium-emphasis">{{ item.created_at }}</span>
          </div>
        </template>

        <template #item.actions="{ item }">
          <div class="action-buttons">
            <v-btn
              v-if="!item.post_deleted"
              size="small"
              color="error"
              variant="flat"
              prepend-icon="mdi-delete"
              class="action-btn"
              @click="deletePost(item.post_id)"
            >
              Delete Post
            </v-btn>
            <v-chip
              v-else
              size="small"
              color="grey"
              prepend-icon="mdi-delete-outline"
              class="action-chip"
            >
              Deleted
            </v-chip>
            <v-btn
              size="small"
              color="warning"
              variant="tonal"
              prepend-icon="mdi-close-circle"
              class="action-btn"
              @click="dismissReport(item.id)"
            >
              Dismiss
            </v-btn>
          </div>
        </template>

        <template #no-data>
          <div class="text-center py-12">
            <v-icon size="80" color="success" class="mb-4">mdi-check-circle-outline</v-icon>
            <h3 class="text-h6 mb-2">No Reports to Review</h3>
            <p class="text-body-2 text-medium-emphasis">All content is currently clear!</p>
          </div>
        </template>
      </v-data-table>
    </v-card>

    <!-- Confirmation Dialog -->
    <v-dialog v-model="deleteDialog" max-width="500">
      <v-card>
        <v-card-title class="d-flex align-center pa-6">
          <v-icon color="error" class="mr-3" size="large">mdi-alert-circle</v-icon>
          <span class="text-h6">Confirm Deletion</span>
        </v-card-title>
        <v-card-text class="pa-6">
          <p class="text-body-1 mb-2">Are you sure you want to delete this post?</p>
          <p class="text-body-2 text-medium-emphasis">
            This action will permanently remove:
          </p>
          <ul class="text-body-2 text-medium-emphasis ml-4 mt-2">
            <li>The reported post</li>
            <li>All related comments</li>
            <li>All associated notifications</li>
          </ul>
          <v-alert type="warning" variant="tonal" class="mt-4">
            This action cannot be undone.
          </v-alert>
        </v-card-text>
        <v-card-actions class="pa-6 pt-0">
          <v-spacer></v-spacer>
          <v-btn
            color="grey"
            variant="text"
            @click="deleteDialog = false"
          >
            Cancel
          </v-btn>
          <v-btn
            color="error"
            variant="flat"
            prepend-icon="mdi-delete"
            @click="confirmDelete"
          >
            Delete Post
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
import { ref, onMounted } from 'vue'
import { supabase } from '../supabase.js'

const reportHeaders = [
  { title: 'Report ID', value: 'id', width: '100px' },
  { title: 'Type', value: 'post_type', width: '120px' },
  { title: 'Content', value: 'post_content', width: '250px' },
  { title: 'Reported By', value: 'user_name', width: '150px' },
  { title: 'Reason', value: 'reason', width: '180px' },
  { title: 'Date', value: 'created_at', width: '180px' },
  { title: 'Actions', value: 'actions', sortable: false, width: '280px' }
]

const allReports = ref([])
const deleteDialog = ref(false)
const postToDelete = ref(null)
const snackbar = ref(false)
const snackbarText = ref('')
const snackbarColor = ref('success')
const snackbarIcon = ref('mdi-check-circle')

function getPostTypeColor(type) {
  const colors = {
    'Question': 'blue',
    'Discussion': 'purple',
    'Advice': 'orange',
    'Story': 'teal',
    'Lost': 'error',
    'Found': 'success'
  }
  return colors[type] || 'grey'
}

function getReasonColor(reason) {
  const lowerReason = reason.toLowerCase()
  if (lowerReason.includes('spam')) return 'orange'
  if (lowerReason.includes('inappropriate') || lowerReason.includes('harassment')) return 'error'
  if (lowerReason.includes('misleading')) return 'warning'
  return 'grey'
}

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
  const { data: reportsData, error } = await supabase
    .from('reports')
    .select('id, post_id, user_id, reason, created_at')
    .order('created_at', { ascending: false })
  if (error) {
    allReports.value = []
    showSnackbar('Failed to load reports', 'error', 'mdi-alert-circle')
    return
  }

  const postIds = [...new Set((reportsData || []).map(r => r.post_id))]
  const userIds = [...new Set((reportsData || []).map(r => r.user_id))]
  let postsMap = {}
  let usersMap = {}

  if (postIds.length > 0) {
    const { data: postsData, error: postsError } = await supabase
      .from('community_posts')
      .select('id, type, content')
      .in('id', postIds)
    if (!postsError && postsData) {
      postsMap = Object.fromEntries(postsData.map(p => [p.id, { type: p.type, content: p.content }]))
    }
  }

  if (userIds.length > 0) {
    const { data: usersData, error: usersError } = await supabase
      .from('users')
      .select('id, name')
      .in('id', userIds)
    if (!usersError && usersData) {
      usersMap = Object.fromEntries(usersData.map(u => [u.id, u.name]))
    }
  }

  allReports.value = (reportsData || []).map(r => ({
    id: r.id,
    post_id: r.post_id,
    post_type: postsMap[r.post_id]?.type ?? '',
    post_content: postsMap[r.post_id]?.content ?? 'Post not found',
    post_deleted: !postsMap[r.post_id],
    user_name: r.reason.toLowerCase().includes('anonymous') ? 'Anonymous' : (usersMap[r.user_id] ?? r.user_id),
    reason: r.reason,
    created_at: r.created_at ? new Date(r.created_at).toLocaleDateString('en-PH', {
      timeZone: 'Asia/Manila',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }) : ''
  }))
}

function deletePost(postId) {
  postToDelete.value = postId
  deleteDialog.value = true
}

async function confirmDelete() {
  deleteDialog.value = false
  const postId = postToDelete.value

  try {
    const { data: comments, error: getCommentsError } = await supabase
      .from('comments')
      .select('id')
      .eq('post_id', postId)
    
    if (getCommentsError) {
      console.error('Error getting comments:', getCommentsError)
      showSnackbar('Failed to delete post: ' + getCommentsError.message, 'error', 'mdi-alert-circle')
      return
    }

    if (comments && comments.length > 0) {
      const commentIds = comments.map(c => c.id)
      const { error: notificationError } = await supabase
        .from('notifications')
        .delete()
        .in('comment_id', commentIds)
      
      if (notificationError) {
        console.error('Error deleting notifications:', notificationError)
      }
    }
    
    const { error: commentError } = await supabase
      .from('comments')
      .delete()
      .eq('post_id', postId)
    
    const { error: postError } = await supabase
      .from('community_posts')
      .delete()
      .eq('id', postId)
    
    if (postError || commentError) {
      const errorMsg = postError?.message || commentError?.message
      console.error('Error deleting post:', errorMsg)
      showSnackbar('Failed to delete post: ' + errorMsg, 'error', 'mdi-alert-circle')
    } else {
      showSnackbar('Post and related data deleted successfully', 'success', 'mdi-check-circle')
    }
  } catch (error) {
    console.error('Error in delete operation:', error)
    showSnackbar('Failed to delete post: ' + error.message, 'error', 'mdi-alert-circle')
  }
  
  await fetchReports()
}

async function dismissReport(reportId) {
  await supabase
    .from('reports')
    .delete()
    .eq('id', reportId)
  showSnackbar('Report dismissed', 'info', 'mdi-information')
  await fetchReports()
}

onMounted(fetchReports)
</script>

<style scoped>
.moderation-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1.5rem;
}

.moderation-card {
  border-radius: 16px;
  border: 1px solid rgba(0, 0, 0, 0.06);
  overflow: hidden;
}

.moderation-table {
  background: transparent;
}

.moderation-table :deep(thead) {
  background: linear-gradient(145deg, #fafafa 0%, #f5f5f5 100%);
}

.moderation-table :deep(thead th) {
  font-weight: 600 !important;
  color: #424242 !important;
  text-transform: uppercase;
  font-size: 0.75rem;
  letter-spacing: 0.05em;
}

.moderation-table :deep(tbody tr) {
  transition: all 0.2s ease;
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
}

.moderation-table :deep(tbody tr:hover) {
  background: #FFF3F0 !important;
  transform: scale(1.01);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.moderation-table :deep(tbody td) {
  padding: 16px 12px !important;
}

.post-content-cell {
  max-width: 250px;
  cursor: help;
}

.action-buttons {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.action-btn {
  text-transform: none;
  letter-spacing: 0;
}

.action-chip {
  font-weight: 500;
}

:deep(.v-table__wrapper) {
  overflow: hidden;
}

h1, h2, h3 {
  font-family: 'Avenir', system-ui, sans-serif;
  letter-spacing: -0.02em;
}

@media (max-width: 960px) {
  .moderation-header {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .action-buttons {
    flex-direction: column;
    width: 100%;
  }
  
  .action-btn {
    width: 100%;
  }
}
</style>