<template>
  <v-container class="py-6">
    <h1>All Reports</h1>
    <v-data-table
      :headers="reportHeaders"
      :items="allReports"
      class="mt-4 moderation-table"
      item-key="id"
      hide-default-footer
    >
      <template #item.actions="{ item }">
        <div class="d-flex">
          <v-btn
            v-if="!item.post_deleted"
            size="small"
            color="error"
            class="action-btn"
            @click="deletePost(item.post_id)"
          >Delete Post</v-btn>
          <v-chip
            v-else
            size="small"
            color="grey"
            class="action-btn"
          >Deleted</v-chip>
          <v-btn
            size="small"
            color="warning"
            class="action-btn"
            @click="dismissReport(item.id)"
          >Dismiss Report</v-btn>
        </div>
      </template>
    </v-data-table>
  </v-container>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from '../supabase.js'

const reportHeaders = [
  { title: 'Report ID', value: 'id' },
  { title: 'Post Type', value: 'post_type' },
  { title: 'Post Content', value: 'post_content' },
  { title: 'User', value: 'user_name' },
  { title: 'Reason', value: 'reason' },
  { title: 'Date', value: 'created_at' },
  { title: 'Actions', value: 'actions', sortable: false }
]

const allReports = ref([])

async function fetchReports() {
  const { data: reportsData, error } = await supabase
    .from('reports')
    .select('id, post_id, user_id, reason, created_at')
    .order('created_at', { ascending: false })
  if (error) {
    allReports.value = []
    return
  }

  // Get unique post_ids and user_ids from reports
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

async function deletePost(postId) {
  if (confirm('Are you sure you want to delete this post? This will also delete all related comments and notifications.')) {
    try {
      // First, get comment IDs for this post
      const { data: comments, error: getCommentsError } = await supabase
        .from('comments')
        .select('id')
        .eq('post_id', postId)
      
      if (getCommentsError) {
        console.error('Error getting comments:', getCommentsError)
        alert('Failed to delete post: ' + getCommentsError.message)
        return
      }

      // Delete related notifications if there are comments
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
      
      // Then delete comments related to this post
      const { error: commentError } = await supabase
        .from('comments')
        .delete()
        .eq('post_id', postId)
      
      // Finally delete the post
      const { error: postError } = await supabase
        .from('community_posts')
        .delete()
        .eq('id', postId)
      
      if (postError || commentError) {
        const errorMsg = postError?.message || commentError?.message
        console.error('Error deleting post:', errorMsg)
        alert('Failed to delete post: ' + errorMsg)
      } else {
        alert('Post and related data deleted successfully')
      }
    } catch (error) {
      console.error('Error in delete operation:', error)
      alert('Failed to delete post: ' + error.message)
    }
    
    await fetchReports()
  }
}

async function dismissReport(reportId) {
  await supabase
    .from('reports')
    .delete()
    .eq('id', reportId)
  await fetchReports()
}

onMounted(fetchReports)
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
.action-btn {
  margin-right: 8px;
  margin-bottom: 4px;
}
.action-btn:last-child {
  margin-right: 0;
}
</style>