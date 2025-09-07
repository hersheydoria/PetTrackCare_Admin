<template>
  <v-app-bar
    v-if="!isDesktop"
    app
    color="white"
    elevation="1"
    class="d-md-none"
  >
    <v-app-bar-nav-icon @click="drawer = !drawer" />
    <span class="ml-2 font-weight-bold">Menu</span>
  </v-app-bar>
  <v-navigation-drawer
    app
    v-model="drawer"
    :permanent="isDesktop"
    :temporary="!isDesktop"
    class="sidebar"
  >
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
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
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

const drawer = ref(true)
const isDesktop = ref(window.innerWidth >= 960)
function handleResize() {
  isDesktop.value = window.innerWidth >= 960
  if (!isDesktop.value) drawer.value = false
  else drawer.value = true
}
onMounted(() => {
  window.addEventListener('resize', handleResize)
  handleResize()
})
onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)
})
</script>

<style scoped>
.sidebar-hover {
  background-color: #F6DED8 !important;
  transition: background 0.2s;
}
/* Hide sidebar on small screens unless toggled */
.sidebar {
  /* No extra styles needed, handled by v-navigation-drawer props */
}
</style>
