<template>
  <v-container class="py-6">
    <h1>All Reports</h1>
    <v-data-table
      :headers="reportHeaders"
      :items="allReports"
      class="mt-4 moderation-table"
      item-key="id"
      hide-default-footer
    />
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
  { title: 'Date', value: 'created_at' }
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
    post_type: postsMap[r.post_id]?.type ?? '',
    post_content: postsMap[r.post_id]?.content ?? '',
    user_name: usersMap[r.user_id] ?? r.user_id,
    reason: r.reason,
    created_at: r.created_at
  }))
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
</style>