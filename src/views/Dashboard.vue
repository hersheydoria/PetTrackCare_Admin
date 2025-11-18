<template>
  <v-container class="py-8 px-6">
    <div class="dashboard-header mb-8">
      <div>
        <h1 class="text-h3 font-weight-bold mb-2">Admin Dashboard</h1>
        <p class="text-subtitle-1 text-medium-emphasis">Monitor your platform's key metrics and activity</p>
      </div>
      <div class="text-caption text-medium-emphasis">
        Last updated: {{ new Date().toLocaleTimeString() }}
      </div>
    </div>

    <v-row>
      <v-col cols="12" sm="6" md="3">
        <v-card color="ownerColor" class="pa-6 dashboard-card stat-card" elevation="0">
          <div class="d-flex align-center justify-space-between mb-3">
            <v-icon size="40" color="white" class="stat-icon">mdi-account-group</v-icon>
            <v-chip size="small" color="white" text-color="ownerColor">+12%</v-chip>
          </div>
          <h3 class="text-subtitle-2 mb-2 text-white">Total Active Users</h3>
          <div class="text-h3 font-weight-bold text-white">{{ stats.activeUsers }}</div>
        </v-card>
      </v-col>
      <v-col cols="12" sm="6" md="3">
        <v-card color="sitterColor" class="pa-6 dashboard-card stat-card" elevation="0">
          <div class="d-flex align-center justify-space-between mb-3">
            <v-icon size="40" color="white" class="stat-icon">mdi-post</v-icon>
            <v-chip size="small" color="white" text-color="sitterColor">This week</v-chip>
          </div>
          <h3 class="text-subtitle-2 mb-2 text-white">Posts This Week</h3>
          <div class="text-h3 font-weight-bold text-white">{{ stats.postsThisWeek }}</div>
        </v-card>
      </v-col>
      <v-col cols="12" sm="6" md="3">
        <v-card color="orange" class="pa-6 dashboard-card stat-card" elevation="0">
          <div class="d-flex align-center justify-space-between mb-3">
            <v-icon size="40" color="white" class="stat-icon">mdi-alert-circle</v-icon>
            <v-chip size="small" color="white" text-color="orange">Active</v-chip>
          </div>
          <h3 class="text-subtitle-2 mb-2 text-white">Lost Pet Alerts</h3>
          <div class="text-h3 font-weight-bold text-white">{{ stats.lostPetAlerts }}</div>
        </v-card>
      </v-col>
      <v-col cols="12" sm="6" md="3">
        <v-card color="lightBlush" class="pa-6 dashboard-card stat-card" elevation="0">
          <div class="d-flex align-center justify-space-between mb-3">
            <v-icon size="40" color="deepRed" class="stat-icon">mdi-flag</v-icon>
            <v-chip size="small" color="deepRed" variant="flat">Needs Review</v-chip>
          </div>
          <h3 class="text-subtitle-2 mb-2 text-grey-darken-2">Flagged Posts</h3>
          <div class="text-h3 font-weight-bold text-grey-darken-3">{{ flaggedPosts.length }}</div>
        </v-card>
      </v-col>
    </v-row>

    <v-row class="mt-4">
      <v-col cols="12" md="6">
        <v-card class="pa-6 dashboard-card info-card" elevation="0">
          <div class="d-flex align-center justify-space-between mb-4">
            <h2 class="text-h5 font-weight-bold">System Health</h2>
            <v-chip 
              :color="systemHealth.api === 'Online' ? 'success' : 'error'" 
              size="small"
              prepend-icon="mdi-circle-small"
            >
              {{ systemHealth.api === 'Online' ? 'All Systems Operational' : 'Issues Detected' }}
            </v-chip>
          </div>
          <v-list class="bg-transparent pa-0">
            <v-list-item 
              class="px-4 py-3 mb-2 health-item"
              :class="systemHealth.api === 'Online' ? 'health-online' : 'health-offline'"
            >
              <template v-slot:prepend>
                <v-avatar :color="systemHealth.api === 'Online' ? 'success' : 'error'" size="40">
                  <v-icon color="white">mdi-api</v-icon>
                </v-avatar>
              </template>
              <v-list-item-title class="font-weight-medium">API Status</v-list-item-title>
              <v-list-item-subtitle class="text-medium-emphasis">{{ systemHealth.api }}</v-list-item-subtitle>
            </v-list-item>
            
            <v-list-item 
              class="px-4 py-3 mb-2 health-item"
              :class="systemHealth.database === 'Healthy' ? 'health-online' : 'health-offline'"
            >
              <template v-slot:prepend>
                <v-avatar :color="systemHealth.database === 'Healthy' ? 'success' : 'error'" size="40">
                  <v-icon color="white">mdi-database</v-icon>
                </v-avatar>
              </template>
              <v-list-item-title class="font-weight-medium">Database</v-list-item-title>
              <v-list-item-subtitle class="text-medium-emphasis">{{ systemHealth.database }}</v-list-item-subtitle>
            </v-list-item>
            
            <v-list-item 
              class="px-4 py-3 health-item"
              :class="systemHealth.storage === 'OK' ? 'health-online' : 'health-offline'"
            >
              <template v-slot:prepend>
                <v-avatar :color="systemHealth.storage === 'OK' ? 'success' : 'warning'" size="40">
                  <v-icon color="white">mdi-cloud-check</v-icon>
                </v-avatar>
              </template>
              <v-list-item-title class="font-weight-medium">Storage</v-list-item-title>
              <v-list-item-subtitle class="text-medium-emphasis">{{ systemHealth.storage }}</v-list-item-subtitle>
            </v-list-item>
          </v-list>
        </v-card>
      </v-col>
      <v-col cols="12" md="6">
        <v-card class="pa-6 dashboard-card info-card" elevation="0">
          <div class="d-flex align-center justify-space-between mb-4">
            <h2 class="text-h5 font-weight-bold">Flagged Posts</h2>
            <v-chip color="error" size="small" v-if="flaggedPosts.length > 0">
              {{ flaggedPosts.length }} pending
            </v-chip>
          </div>
          <v-list class="bg-transparent pa-0" v-if="flaggedPosts.length > 0">
            <v-list-item
              v-for="post in flaggedPosts"
              :key="post.id"
              class="px-4 py-3 mb-2 flagged-item"
            >
              <template v-slot:prepend>
                <v-avatar color="error" size="40">
                  <v-icon color="white">mdi-flag-variant</v-icon>
                </v-avatar>
              </template>
              <v-list-item-title class="font-weight-medium text-wrap">{{ post.post_content }}</v-list-item-title>
              <v-list-item-subtitle class="text-medium-emphasis">
                <v-icon size="small" class="mr-1">mdi-alert-circle-outline</v-icon>
                {{ post.reason }}
              </v-list-item-subtitle>
            </v-list-item>
          </v-list>
          <div v-else class="text-center py-8">
            <v-icon size="64" color="success" class="mb-3">mdi-check-circle-outline</v-icon>
            <p class="text-subtitle-1 text-medium-emphasis">No flagged posts to review</p>
          </div>
          <v-btn 
            color="deepRed" 
            class="mt-4" 
            to="/moderation"
            variant="flat"
            block
            size="large"
            prepend-icon="mdi-shield-check"
          >
            Go to Moderation
          </v-btn>
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

  // Lost pet alerts: pets where is_missing = true
  const { count: alertCount, error: alertError } = await supabase
    .from('pets')
    .select('*', { count: 'exact', head: true })
    .eq('is_missing', true)
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
.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
}

.dashboard-card {
  border-radius: 16px;
  border: 1px solid rgba(0, 0, 0, 0.06);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.stat-card {
  position: relative;
  overflow: hidden;
}

.stat-card::before {
  content: '';
  position: absolute;
  top: 0;
  right: 0;
  width: 100px;
  height: 100px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  transform: translate(30%, -30%);
  transition: transform 0.3s ease;
}

.stat-card:hover::before {
  transform: translate(30%, -30%) scale(1.5);
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
}

.stat-icon {
  opacity: 0.9;
  transition: transform 0.3s ease;
}

.stat-card:hover .stat-icon {
  transform: scale(1.1) rotate(5deg);
}

.info-card {
  background: linear-gradient(145deg, #ffffff 0%, #fafafa 100%);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.info-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.1);
}

.health-item, .flagged-item {
  border-radius: 12px;
  background: white;
  transition: all 0.2s ease;
}

.health-item:hover, .flagged-item:hover {
  background: #f5f5f5;
  transform: translateX(4px);
}

.health-online {
  border-left: 4px solid #4caf50;
}

.health-offline {
  border-left: 4px solid #f44336;
}

:deep(.v-list) {
  overflow: hidden;
}

h1, h2, h3 {
  font-family: 'Avenir', system-ui, sans-serif;
  letter-spacing: -0.02em;
}

@media (max-width: 960px) {
  .dashboard-header {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>