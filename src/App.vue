<template>
  <v-app>
    <template v-if="$route.path !== '/login'">
      <Navbar />
      <Sidebar />
    </template>
    <v-main>
      <router-view />
    </v-main>
  </v-app>
</template>

<script setup>
import Navbar from './components/Navbar.vue'
import Sidebar from './components/Sidebar.vue'
import { useRoute } from 'vue-router'
const $route = useRoute()
</script>
