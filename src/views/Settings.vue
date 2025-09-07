<template>
  <v-container class="py-6">
    <h1>Settings</h1>
    <v-row>
      <v-col cols="12" md="6">
        <v-card class="pa-4 settings-card mb-4">
          <h2>Admin Profile</h2>
          <v-text-field label="Name" v-model="adminProfile.name" prepend-icon="mdi-account" />
          <v-text-field label="Email" v-model="adminProfile.email" prepend-icon="mdi-email" />
          <v-btn color="primary" class="mt-2" @click="updateProfile" :loading="profileLoading">Update Profile</v-btn>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from '../supabase.js'

const adminProfile = ref({ name: '', email: '' })
const profileLoading = ref(false)

async function fetchSettings() {
  // Fetch admin profile (assuming single admin with role 'Admin')
  const { data: admin } = await supabase
    .from('users')
    .select('name, email')
    .eq('role', 'Admin')
    .single()
  if (admin) {
    adminProfile.value.name = admin.name ?? ''
    adminProfile.value.email = admin.email ?? ''
  }
}

async function updateProfile() {
  profileLoading.value = true
  await supabase
    .from('users')
    .update({
      name: adminProfile.value.name,
      email: adminProfile.value.email
    })
    .eq('role', 'Admin')
  profileLoading.value = false
}

onMounted(fetchSettings)
</script>

<style scoped>
.settings-card {
  border-radius: 18px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.08);
  transition: box-shadow 0.2s, transform 0.2s;
}
.settings-card:hover {
  box-shadow: 0 4px 24px rgba(184,33,50,0.18);
  transform: translateY(-2px) scale(1.02);
}
h1, h2 {
  font-family: 'Avenir', system-ui, sans-serif;
  font-weight: 700;
}
</style>