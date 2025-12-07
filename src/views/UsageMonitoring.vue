<template>
  <v-container class="py-8 px-6">
    <div class="monitoring-header mb-8">
      <div>
        <h1 class="text-h3 font-weight-bold mb-2">Usage Monitoring</h1>
        <p class="text-subtitle-1 text-medium-emphasis">Track platform activity and user engagement</p>
      </div>
      <div>
        <v-select 
          v-model="selectedRole" 
          :items="roles" 
          label="Filter by Role"
          density="comfortable"
          prepend-inner-icon="mdi-filter"
          variant="outlined"
          class="role-filter"
        />
      </div>
    </div>

    <v-row>
      <v-col cols="12" sm="6" md="3">
        <v-card class="stat-card pa-6" elevation="0">
          <div class="d-flex align-center justify-space-between mb-3">
            <v-icon size="40" color="primary" class="stat-icon">mdi-login</v-icon>
            <v-chip size="small" color="primary" variant="tonal">Active</v-chip>
          </div>
          <h3 class="text-subtitle-2 mb-2 text-medium-emphasis">User Logins</h3>
          <div class="text-h4 font-weight-bold text-primary">{{ loginCount }}</div>
        </v-card>
      </v-col>
      <v-col cols="12" sm="6" md="3">
        <v-card class="stat-card pa-6" elevation="0">
          <div class="d-flex align-center justify-space-between mb-3">
            <v-icon size="40" color="sitterColor" class="stat-icon">mdi-post</v-icon>
            <v-chip size="small" color="sitterColor" variant="tonal">This Month</v-chip>
          </div>
          <h3 class="text-subtitle-2 mb-2 text-medium-emphasis">Community Posts</h3>
          <div class="text-h4 font-weight-bold text-sitterColor">{{ postCount }}</div>
        </v-card>
      </v-col>
      <v-col cols="12" sm="6" md="3">
        <v-card class="stat-card pa-6" elevation="0">
          <div class="d-flex align-center justify-space-between mb-3">
            <v-icon size="40" color="warning" class="stat-icon">mdi-map-marker</v-icon>
            <v-chip size="small" color="warning" variant="tonal">GPS</v-chip>
          </div>
          <h3 class="text-subtitle-2 mb-2 text-medium-emphasis">GPS Check-ins</h3>
          <div class="text-h4 font-weight-bold text-warning">{{ gpsCount }}</div>
        </v-card>
      </v-col>
      <v-col cols="12" sm="6" md="3">
        <v-card class="stat-card pa-6" elevation="0">
          <div class="d-flex align-center justify-space-between mb-3">
            <v-icon size="40" color="deepRed" class="stat-icon">mdi-note-multiple</v-icon>
            <v-chip size="small" color="deepRed" variant="tonal" text-color="white">Logs</v-chip>
          </div>
          <h3 class="text-subtitle-2 mb-2 text-medium-emphasis">Behavior Logs</h3>
          <div class="text-h4 font-weight-bold text-deepRed">{{ behaviorCount }}</div>
        </v-card>
      </v-col>
    </v-row>

    <v-row class="mt-4">
      <v-col cols="12" md="6">
        <v-card class="chart-card pa-6" elevation="0">
          <h2 class="text-h6 font-weight-bold mb-6">Login Activity</h2>
          <div class="chart-wrapper">
            <v-chart :option="loginChartOptions" style="width:100%;height:300px;" />
          </div>
        </v-card>
      </v-col>
      <v-col cols="12" md="6">
        <v-card class="chart-card pa-6" elevation="0">
          <h2 class="text-h6 font-weight-bold mb-6">Community Post Activity</h2>
          <div class="chart-wrapper">
            <v-chart :option="postChartOptions" style="width:100%;height:300px;" />
          </div>
        </v-card>
      </v-col>
      <v-col cols="12" md="6">
        <v-card class="chart-card pa-6" elevation="0">
          <h2 class="text-h6 font-weight-bold mb-6">GPS Check-in Activity</h2>
          <div class="chart-wrapper">
            <v-chart :option="gpsChartOptions" style="width:100%;height:300px;" />
          </div>
        </v-card>
      </v-col>
      <v-col cols="12" md="6">
        <v-card class="chart-card pa-6" elevation="0">
          <h2 class="text-h6 font-weight-bold mb-6">Behavior Log Submissions</h2>
          <div class="chart-wrapper">
            <v-chart :option="behaviorChartOptions" style="width:100%;height:300px;" />
          </div>
        </v-card>
      </v-col>
    </v-row>

    <!-- Legend Info -->
    <v-card class="pa-6 mt-4 info-card" elevation="0">
      <v-row>
        <v-col cols="12" sm="6" md="3" class="mb-4">
          <div class="d-flex align-center">
            <div class="legend-color" style="background: #1976D2;"></div>
            <span class="text-body-2">Logins</span>
          </div>
        </v-col>
        <v-col cols="12" sm="6" md="3" class="mb-4">
          <div class="d-flex align-center">
            <div class="legend-color" style="background: #ECA1A6;"></div>
            <span class="text-body-2">Community Posts</span>
          </div>
        </v-col>
        <v-col cols="12" sm="6" md="3" class="mb-4">
          <div class="d-flex align-center">
            <div class="legend-color" style="background: #FB8C00;"></div>
            <span class="text-body-2">GPS Check-ins</span>
          </div>
        </v-col>
        <v-col cols="12" sm="6" md="3" class="mb-4">
          <div class="d-flex align-center">
            <div class="legend-color" style="background: #B82132;"></div>
            <span class="text-body-2">Behavior Logs</span>
          </div>
        </v-col>
      </v-row>
    </v-card>
  </v-container>
</template>

<script setup>
// filepath: c:\Users\User\OneDrive\Desktop\app\pettrackcare_admin\src\views\UsageMonitoring.vue
// filepath: c:\Users\User\OneDrive\Desktop\app\pettrackcare_admin\src\views\UsageMonitoring.vue
import { ref, watch, onMounted, computed } from 'vue'
import { fetchUsageMetrics } from '../apiClient.js'
const roles = ['All', 'Owner', 'Sitter']
const selectedRole = ref('All')

const loginCount = ref(0)
const postCount = ref(0)
const gpsCount = ref(0)
const behaviorCount = ref(0)

const loginChartOptions = computed(() => ({
  xAxis: { type: 'category', data: ['Logins'] },
  yAxis: { type: 'value' },
  series: [{ data: [loginCount.value], type: 'bar', color: '#1976D2' }]
}))
const postChartOptions = computed(() => ({
  xAxis: { type: 'category', data: ['Posts'] },
  yAxis: { type: 'value' },
  series: [{ data: [postCount.value], type: 'bar', color: '#ECA1A6' }]
}))
const gpsChartOptions = computed(() => ({
  xAxis: { type: 'category', data: ['Check-ins'] },
  yAxis: { type: 'value' },
  series: [{ data: [gpsCount.value], type: 'bar', color: '#F6DED8' }]
}))
const behaviorChartOptions = computed(() => ({
  xAxis: { type: 'category', data: ['Submissions'] },
  yAxis: { type: 'value' },
  series: [{ data: [behaviorCount.value], type: 'bar', color: '#B82132' }]
}))

async function loadMetrics() {
  try {
    const roleMap = {
      Owner: 'Pet Owner',
      Sitter: 'Pet Sitter'
    }
    const roleParam = roleMap[selectedRole.value] || undefined
    const data = await fetchUsageMetrics(roleParam)
    loginCount.value = data.login_count ?? 0
    postCount.value = data.post_count ?? 0
    gpsCount.value = data.gps_count ?? 0
    behaviorCount.value = data.behavior_count ?? 0
  } catch (error) {
    console.error('Error loading usage metrics:', error)
    loginCount.value = 0
    postCount.value = 0
    gpsCount.value = 0
    behaviorCount.value = 0
  }
}

watch(selectedRole, loadMetrics)
onMounted(loadMetrics)
</script>

<style scoped>
.monitoring-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  flex-wrap: wrap;
  gap: 2rem;
}

.role-filter {
  min-width: 200px;
}

.stat-card {
  border-radius: 16px;
  border: 1px solid rgba(0, 0, 0, 0.06);
  position: relative;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
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

.chart-card {
  border-radius: 16px;
  border: 1px solid rgba(0, 0, 0, 0.06);
  background: linear-gradient(145deg, #ffffff 0%, #fafafa 100%);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.chart-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.1);
}

.chart-wrapper {
  width: 100%;
  min-width: 220px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.info-card {
  border-radius: 16px;
  border: 1px solid rgba(0, 0, 0, 0.06);
  background: linear-gradient(145deg, #ffffff 0%, #fafafa 100%);
}

.legend-color {
  width: 16px;
  height: 16px;
  border-radius: 4px;
  margin-right: 12px;
}

h1, h2 {
  font-family: 'Avenir', system-ui, sans-serif;
  font-weight: 700;
  letter-spacing: -0.02em;
}

@media (max-width: 960px) {
  .monitoring-header {
    flex-direction: column;
    align-items: stretch;
  }

  .role-filter {
    min-width: 100%;
  }
}
</style>