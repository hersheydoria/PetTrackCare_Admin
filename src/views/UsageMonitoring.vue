<template>
  <v-container class="py-6">
    <h1>Usage Monitoring</h1>
    <v-row class="mb-4">
      <v-col cols="12" sm="6" md="4">
        <v-select :items="roles" label="User Role" v-model="selectedRole" />
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="12" md="6">
        <v-card class="pa-4 mb-4 usage-card">
          <h2>Login Counts</h2>
          <div class="chart-wrapper">
            <v-chart :option="loginChartOptions" style="width:100%;height:260px;" />
          </div>
        </v-card>
      </v-col>
      <v-col cols="12" md="6">
        <v-card class="pa-4 mb-4 usage-card">
          <h2>Community Post Activity</h2>
          <div class="chart-wrapper">
            <v-chart :option="postChartOptions" style="width:100%;height:260px;" />
          </div>
        </v-card>
      </v-col>
      <v-col cols="12" md="6">
        <v-card class="pa-4 mb-4 usage-card">
          <h2>GPS Check-ins</h2>
          <div class="chart-wrapper">
            <v-chart :option="gpsChartOptions" style="width:100%;height:260px;" />
          </div>
        </v-card>
      </v-col>
      <v-col cols="12" md="6">
        <v-card class="pa-4 mb-4 usage-card">
          <h2>Behavior Log Submissions</h2>
          <div class="chart-wrapper">
            <v-chart :option="behaviorChartOptions" style="width:100%;height:260px;" />
          </div>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
// filepath: c:\Users\User\OneDrive\Desktop\app\pettrackcare_admin\src\views\UsageMonitoring.vue
import { ref, watch, onMounted, computed } from 'vue'
import { supabase } from '../supabase.js'
import VChart from 'vue-echarts'

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

async function fetchLoginCount() {
  let query = supabase.from('users').select('*', { count: 'exact', head: true })
  if (selectedRole.value !== 'All') {
    query = query.eq('role', selectedRole.value === 'Owner' ? 'Pet Owner' : 'Pet Sitter')
  }
  const { count } = await query
  loginCount.value = count ?? 0
}

async function fetchPostCount() {
  let query = supabase.from('community_posts').select('*', { count: 'exact', head: true })
  if (selectedRole.value !== 'All') {
    const { data: users } = await supabase
      .from('users')
      .select('id')
      .eq('role', selectedRole.value === 'Owner' ? 'Pet Owner' : 'Pet Sitter')
    const userIds = (users || []).map(u => u.id)
    if (userIds.length) query = query.in('user_id', userIds)
    else { postCount.value = 0; return }
  }
  const { count } = await query
  postCount.value = count ?? 0
}

async function fetchGPSCount() {
  let query = supabase.from('location_history').select('*', { count: 'exact', head: true })
  const { count } = await query
  gpsCount.value = count ?? 0
}

async function fetchBehaviorCount() {
  let query = supabase.from('behavior_logs').select('id, user_id', { count: 'exact', head: true })
  if (selectedRole.value !== 'All') {
    const { data: users } = await supabase
      .from('users')
      .select('id')
      .eq('role', selectedRole.value === 'Owner' ? 'Pet Owner' : 'Pet Sitter')
    const userIds = (users || []).map(u => u.id)
    if (userIds.length) query = query.in('user_id', userIds)
    else { behaviorCount.value = 0; return }
  }
  const { count } = await query
  behaviorCount.value = count ?? 0
}

async function fetchAll() {
  await fetchLoginCount()
  await fetchPostCount()
  await fetchGPSCount()
  await fetchBehaviorCount()
}

watch([selectedRole], fetchAll)
onMounted(fetchAll)
</script>

<style scoped>
.usage-card {
  border-radius: 18px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.08);
  transition: box-shadow 0.2s, transform 0.2s;
}
.usage-card:hover {
  box-shadow: 0 4px 24px rgba(184,33,50,0.18);
  transform: translateY(-2px) scale(1.02);
}
.chart-wrapper {
  width: 100%;
  min-width: 220px;
  height: 260px;
  display: flex;
  align-items: center;
  justify-content: center;
}
h1, h2 {
  font-family: 'Avenir', system-ui, sans-serif;
  font-weight: 700;
}
</style>