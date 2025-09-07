<template>
  <v-container class="py-6">
    <h1>Settings</h1>
    <v-row>
      <!-- Admin Account Section -->
      <v-col cols="12" md="6">
        <v-card class="pa-4 settings-card mb-4">
          <h2>Admin Account</h2>

          <v-text-field
            label="Name"
            v-model="adminProfile.name"
            prepend-icon="mdi-account"
          />

          <v-switch
            label="Account Active"
            v-model="adminProfile.active"
            color="primary"
          />

          <v-btn
            color="primary"
            class="mt-2"
            @click="updateProfile"
            :loading="profileLoading"
          >
            Update Profile
          </v-btn>
        </v-card>
      </v-col>

      <!-- Password Update Section -->
      <v-col cols="12" md="6">
        <v-card class="pa-4 settings-card mb-4">
          <h2>Update Password</h2>

          <v-text-field
            v-model="passwords.current"
            label="Current Password"
            prepend-icon="mdi-lock"
            type="password"
          />

          <v-text-field
            v-model="passwords.newPassword"
            label="New Password"
            prepend-icon="mdi-lock-reset"
            type="password"
          />

          <v-text-field
            v-model="passwords.confirmPassword"
            label="Confirm New Password"
            prepend-icon="mdi-lock-check"
            type="password"
          />

          <v-btn
            color="primary"
            class="mt-2"
            @click="updatePassword"
            :loading="passwordLoading"
          >
            Change Password
          </v-btn>
        </v-card>
      </v-col>
    </v-row>

    <!-- Dialog for messages -->
    <v-dialog v-model="profileMessageDialog" max-width="400">
      <v-card>
        <v-card-title class="text-h6">Notification</v-card-title>
        <v-card-text>{{ profileMessage }}</v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn color="primary" @click="profileMessageDialog = false">OK</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '../supabase.js'

const adminProfile = ref({ id: '', name: '', active: true })
const profileLoading = ref(false)
const profileMessage = ref('')
const profileMessageDialog = ref(false)

const passwords = ref({ current: '', newPassword: '', confirmPassword: '' })
const passwordLoading = ref(false)

const router = useRouter()

async function fetchSettings() {
  const { data: admin } = await supabase
    .from('users')
    .select('id, name, status')
    .eq('role', 'Admin')
    .single()
  if (admin) {
    adminProfile.value.id = admin.id
    adminProfile.value.name = admin.name ?? ''
    adminProfile.value.active = admin.status !== 'Inactive'
  }
}

async function updateProfile() {
  profileLoading.value = true
  const { error } = await supabase
    .from('users')
    .update({
      name: adminProfile.value.name,
      status: adminProfile.value.active ? 'Active' : 'Inactive'
    })
    .eq('id', adminProfile.value.id)

  profileLoading.value = false
  profileMessage.value = error
    ? `Failed to update profile: ${error.message}`
    : 'Profile updated!'
  profileMessageDialog.value = true
  if (!error) await fetchSettings()
}

async function updatePassword() {
  if (passwords.value.newPassword !== passwords.value.confirmPassword) {
    profileMessage.value = 'New password and confirmation do not match.'
    profileMessageDialog.value = true
    return
  }

  passwordLoading.value = true
  const { error } = await supabase.auth.updateUser({
    password: passwords.value.newPassword
  })
  passwordLoading.value = false

  profileMessage.value = error
    ? `Failed to update password: ${error.message}`
    : 'Password updated successfully!'
  profileMessageDialog.value = true

  if (!error) passwords.value = { current: '', newPassword: '', confirmPassword: '' }
}

onMounted(fetchSettings)
</script>

<style scoped>
.settings-card {
  border-radius: 18px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.08);
}
h1, h2 {
  font-family: 'Avenir', system-ui, sans-serif;
  font-weight: 700;
}
</style>
