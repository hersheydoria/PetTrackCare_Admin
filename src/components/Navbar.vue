<template>
  <v-app-bar app color="ownerColor" dark>
    <v-toolbar-title>
      <img src="../assets/logo.png" alt="Logo" style="height:50px;vertical-align:middle;margin-right:12px;" />
      PetTrackCare Admin
    </v-toolbar-title>
    <v-spacer />
    <v-tooltip text="Logout" location="bottom">
      <template v-slot:activator="{ props }">
        <v-btn color="deepRed" variant="outlined" class="mr-4 logout-btn" @click="logout" icon size="small" v-bind="props">
          <v-icon size="small">mdi-logout</v-icon>
        </v-btn>
      </template>
    </v-tooltip>
  </v-app-bar>
</template>

<script setup>
import { supabase } from '../supabase'
async function logout() {
  // Sign out from Supabase
  await supabase.auth.signOut()
  // Clear local login state
  localStorage.removeItem('isLoggedIn')
  // Redirect to login page
  window.location.href = '/login';
}
</script>

<style scoped>
.logout-btn:hover {
  background-color: rgba(139, 0, 0, 0.8) !important;
}
</style>
