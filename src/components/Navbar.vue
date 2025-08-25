<template>
  <v-app-bar app color="ownerColor" dark>
    <v-toolbar-title>
      <img src="../assets/logo.png" alt="Logo" style="height:50px;vertical-align:middle;margin-right:12px;" />
      PetTrackCare Admin
    </v-toolbar-title>
    <v-spacer />
    <v-btn color="deepRed" variant="outlined" class="ml-4" @click="logout">Logout</v-btn>
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
