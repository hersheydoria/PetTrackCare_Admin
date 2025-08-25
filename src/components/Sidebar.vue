<template>
  <v-navigation-drawer app>
    <v-list nav>
      <v-list-item
        v-for="item in items"
        :key="item.title"
        :to="item.to"
        :prepend-icon="item.icon"
        :title="item.title"
        :active="$route.path === item.to"
        active-color="deepRed"
        @mouseover="hovered = item.to"
        :class="{ 'sidebar-hover': hovered === item.to }"
      />
    </v-list>
  </v-navigation-drawer>
</template>

<script setup>
import { ref } from 'vue'
import { useRoute } from 'vue-router'
const hovered = ref('')
const $route = useRoute()
const items = [
  { to: '/', title: 'Dashboard', icon: 'mdi-view-dashboard' },
  { to: '/user-management', title: 'User Management', icon: 'mdi-account-cog' },
  { to: '/reports-feedback', title: 'Reports & Feedback', icon: 'mdi-message-alert' },
  { to: '/usage-monitoring', title: 'Usage Monitoring', icon: 'mdi-chart-bar' },
  { to: '/settings', title: 'Settings', icon: 'mdi-cog' },
]
</script>

<style scoped>
.sidebar-hover {
  background-color: #F6DED8 !important;
  transition: background 0.2s;
}
</style>
