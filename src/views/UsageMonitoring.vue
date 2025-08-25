<template>
  <v-container class="py-6">
    <h1>Usage Monitoring</h1>
    <v-row class="mb-4">
      <v-col cols="12" sm="6" md="4">
        <v-select :items="roles" label="User Role" v-model="selectedRole" />
      </v-col>
      <v-col cols="12" sm="6" md="4">
        <v-menu v-model="menu" :close-on-content-click="false" transition="scale-transition" offset-y>
          <template #activator="{ on, attrs }">
            <v-text-field v-model="date" label="Date" readonly v-bind="attrs" v-on="on" />
          </template>
          <v-date-picker v-model="date" @input="menu = false" />
        </v-menu>
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="12" md="6">
  <v-card class="pa-4 mb-4 usage-card">
          <h2>Login Counts</h2>
          <div style="height:200px;">[Chart Placeholder]</div>
        </v-card>
      </v-col>
      <v-col cols="12" md="6">
  <v-card class="pa-4 mb-4 usage-card">
          <h2>Community Post Activity</h2>
          <div style="height:200px;">[Chart Placeholder]</div>
        </v-card>
      </v-col>
      <v-col cols="12" md="6">
  <v-card class="pa-4 mb-4 usage-card">
          <h2>GPS Check-ins</h2>
          <div style="height:200px;">[Chart Placeholder]</div>
        </v-card>
      </v-col>
      <v-col cols="12" md="6">
  <v-card class="pa-4 mb-4 usage-card">
          <h2>Behavior Log Submissions</h2>
          <div style="height:200px;">[Chart Placeholder]</div>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref } from 'vue'
const roles = ['All', 'Owner', 'Sitter']
const selectedRole = ref('All')
const date = ref('')
const menu = ref(false)
// ...existing code...
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
h1, h2 {
  font-family: 'Avenir', system-ui, sans-serif;
  font-weight: 700;
}
</style>
