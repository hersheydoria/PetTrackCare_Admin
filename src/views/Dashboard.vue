<template>
  <v-container class="py-6">
    <h1 class="mb-6">Admin Dashboard</h1>
    <v-row>
      <v-col cols="12" sm="6" md="3">
        <v-card color="ownerColor" class="pa-4 dashboard-card">
          <h2>Total Active Users</h2>
          <div class="text-h4">{{ stats.activeUsers }}</div>
        </v-card>
      </v-col>
      <v-col cols="12" sm="6" md="3">
        <v-card color="sitterColor" class="pa-4 dashboard-card">
          <h2>Posts This Week</h2>
          <div class="text-h4">{{ stats.postsThisWeek }}</div>
        </v-card>
      </v-col>
      <v-col cols="12" sm="6" md="3">
        <v-card color="deepRed" class="pa-4 dashboard-card">
          <h2>Lost Pet Alerts</h2>
          <div class="text-h4">{{ stats.lostPetAlerts }}</div>
        </v-card>
      </v-col>
      <v-col cols="12" sm="6" md="3">
        <v-card color="lightBlush" class="pa-4 dashboard-card">
          <h2>Flagged Posts</h2>
          <div class="text-h4">{{ flaggedPosts.length }}</div>
        </v-card>
      </v-col>
    </v-row>

    <v-row class="mt-8">
      <v-col cols="12" md="6">
        <v-card class="pa-4 dashboard-card">
          <h2>System Health</h2>
          <v-list>
            <v-list-item title="API Status" :subtitle="systemHealth.api" prepend-icon="mdi-check-circle" />
            <v-list-item title="Database" :subtitle="systemHealth.database" prepend-icon="mdi-database" />
            <v-list-item title="Storage" :subtitle="systemHealth.storage" prepend-icon="mdi-cloud-check" />
          </v-list>
        </v-card>
      </v-col>
      <v-col cols="12" md="6">
        <v-card class="pa-4 dashboard-card">
          <h2>Flagged Posts</h2>
          <v-list>
            <v-list-item
              v-for="post in flaggedPosts"
              :key="post.id"
              :title="post.post_content"
              :subtitle="post.reason"
            />
          </v-list>
          <v-btn color="deepRed" class="mt-4" to="/moderation">Go to Moderation</v-btn>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { supabase } from '../supabase.js'

const stats = ref({
  activeUsers: 0,
  postsThisWeek: 0,
  lostPetAlerts: 0,
})
const flaggedPosts = ref([])
const systemHealth = ref({
  api: 'Checking...',
  database: 'Checking...',
  storage: 'Checking...',
})

async function fetchStats() {
  // Active users: users with role not 'Admin'
  const { count: userCount, error: userError } = await supabase
    .from('users')
    .select('*', { count: 'exact', head: true })
    .neq('role', 'Admin')
  stats.value.activeUsers = userCount ?? 0

  // Posts this week: community_posts created in last 7 days
  const { count: postCount, error: postError } = await supabase
    .from('community_posts')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
  stats.value.postsThisWeek = postCount ?? 0

  // Lost pet alerts: lost_found_posts where type = 'Lost'
  const { count: alertCount, error: alertError } = await supabase
    .from('lost_found_posts')
    .select('*', { count: 'exact', head: true })
    .eq('type', 'Lost')
  stats.value.lostPetAlerts = alertCount ?? 0
}

async function fetchFlaggedPosts() {
  // Get latest 3 flagged posts from reports table
  const { data: reportsData, error } = await supabase
    .from('reports')
    .select('id, post_id, reason')
    .order('created_at', { ascending: false })
    .limit(3)
  if (error) {
    flaggedPosts.value = []
    return
  }

  // Get unique post_ids from reports
  const postIds = [...new Set((reportsData || []).map(r => r.post_id))]
  let postsMap = {}
  if (postIds.length > 0) {
    const { data: postsData, error: postsError } = await supabase
      .from('community_posts')
      .select('id, content')
      .in('id', postIds)
    if (!postsError && postsData) {
      postsMap = Object.fromEntries(postsData.map(p => [p.id, p.content]))
    }
  }

  flaggedPosts.value = (reportsData || []).map(report => ({
    id: report.post_id,
    reason: report.reason,
    post_content: postsMap[report.post_id]?.slice(0, 50) + '...' || 'Reported post'
  }))
}

let healthInterval = null

async function checkSystemHealth() {
  console.log('Starting health check...')
  try {
    // API check: try a simple query
    const { data, error: apiError } = await supabase.from('users').select('id').limit(1)
    console.log('API check result:', { data, error: apiError })
    systemHealth.value.api = apiError ? 'Offline' : 'Online'
    systemHealth.value.database = apiError ? 'Issue' : 'Healthy'

    // Storage check: simplified approach
    try {
      const { error: storageError } = await supabase.storage.listBuckets()
      console.log('Storage check result:', { error: storageError })
      systemHealth.value.storage = storageError ? 'Issue' : 'OK'
    } catch (storageErr) {
      console.log('Storage not available:', storageErr)
      systemHealth.value.storage = 'N/A'
    }
  } catch (error) {
    console.error('Health check error:', error)
    systemHealth.value.api = 'Offline'
    systemHealth.value.database = 'Issue' 
    systemHealth.value.storage = 'Issue'
  }
}

onMounted(async () => {
  await fetchStats()
  await fetchFlaggedPosts()
  await checkSystemHealth()
  healthInterval = setInterval(checkSystemHealth, 10000)
})

onBeforeUnmount(() => {
  if (healthInterval) clearInterval(healthInterval)
})
</script>

<style scoped>
.dashboard-card {
  border-radius: 18px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.08);
  transition: box-shadow 0.2s, transform 0.2s;
}
.dashboard-card:hover {
  box-shadow: 0 4px 24px rgba(184,33,50,0.18);
  transform: translateY(-2px) scale(1.02);
}
h1, h2 {
  font-family: 'Avenir', system-ui, sans-serif;
  font-weight: 700;
}
</style>