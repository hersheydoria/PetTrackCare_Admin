<template>
  <v-container class="py-8 px-6">
    <div class="settings-header mb-8">
      <div>
        <h1 class="text-h3 font-weight-bold mb-2">Settings</h1>
        <p class="text-subtitle-1 text-medium-emphasis">Manage your admin account and security preferences</p>
      </div>
    </div>

    <v-row>
      <!-- Admin Account Section -->
      <v-col cols="12" md="6">
        <v-card class="settings-card pa-8" elevation="0">
          <div class="d-flex align-center mb-6">
            <v-icon color="primary" size="large" class="mr-3">mdi-account-circle</v-icon>
            <div>
              <h2 class="text-h6 font-weight-bold mb-1">Admin Account</h2>
              <p class="text-caption text-medium-emphasis mb-0">Update your profile information</p>
            </div>
          </div>

          <v-divider class="my-6"></v-divider>

          <v-text-field
            label="Full Name"
            v-model="adminProfile.name"
            prepend-inner-icon="mdi-account"
            variant="outlined"
            density="comfortable"
            class="mb-4"
          />

          <v-switch
            label="Account Status"
            v-model="adminProfile.active"
            color="primary"
            inset
            class="mb-4"
          >
            <template #prepend>
              <v-icon size="small" class="mr-2">mdi-check-circle</v-icon>
            </template>
          </v-switch>

          <div v-if="adminProfile.active" class="mb-4">
            <v-chip size="small" color="success" prepend-icon="mdi-circle-small" variant="tonal">
              Account Active
            </v-chip>
          </div>
          <div v-else class="mb-4">
            <v-chip size="small" color="warning" prepend-icon="mdi-alert-circle" variant="tonal">
              Account Inactive
            </v-chip>
          </div>

          <v-btn
            color="primary"
            variant="flat"
            prepend-icon="mdi-content-save"
            block
            size="large"
            @click="updateProfile"
            :loading="profileLoading"
            class="mt-6"
          >
            Save Changes
          </v-btn>
        </v-card>
      </v-col>

      <!-- Password Update Section -->
      <v-col cols="12" md="6">
        <v-card class="settings-card pa-8" elevation="0">
          <div class="d-flex align-center mb-6">
            <v-icon color="deepRed" size="large" class="mr-3">mdi-lock</v-icon>
            <div>
              <h2 class="text-h6 font-weight-bold mb-1">Security</h2>
              <p class="text-caption text-medium-emphasis mb-0">Update your password regularly</p>
            </div>
          </div>

          <v-divider class="my-6"></v-divider>

          <v-text-field
            v-model="passwords.current"
            label="Current Password"
            prepend-inner-icon="mdi-lock"
            variant="outlined"
            type="password"
            density="comfortable"
            class="mb-4"
          />

          <v-text-field
            v-model="passwords.newPassword"
            label="New Password"
            prepend-inner-icon="mdi-lock-reset"
            variant="outlined"
            type="password"
            density="comfortable"
            class="mb-4"
          />

          <v-text-field
            v-model="passwords.confirmPassword"
            label="Confirm New Password"
            prepend-inner-icon="mdi-lock-check"
            variant="outlined"
            type="password"
            density="comfortable"
            class="mb-4"
          />

          <v-alert 
            type="info" 
            variant="tonal" 
            icon="mdi-information"
            closable
            class="mb-6"
          >
            <strong>Password Requirements:</strong>
            <ul class="mt-2 mb-0" style="padding-left: 20px;">
              <li>At least 8 characters long</li>
              <li>Mix of uppercase and lowercase letters</li>
              <li>Include numbers or special characters</li>
            </ul>
          </v-alert>

          <v-btn
            color="deepRed"
            variant="flat"
            prepend-icon="mdi-check"
            block
            size="large"
            @click="updatePassword"
            :loading="passwordLoading"
          >
            Change Password
          </v-btn>
        </v-card>
      </v-col>
    </v-row>

    <!-- Success/Error Snackbar -->
    <v-snackbar
      v-model="showSnackbar"
      :color="snackbarColor"
      :timeout="3000"
      location="top"
    >
      <div class="d-flex align-center">
        <v-icon class="mr-2">{{ snackbarIcon }}</v-icon>
        {{ snackbarMessage }}
      </div>
    </v-snackbar>
  </v-container>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '../supabase.js'

const adminProfile = ref({ id: '', name: '', active: true })
const profileLoading = ref(false)
const passwords = ref({ current: '', newPassword: '', confirmPassword: '' })
const passwordLoading = ref(false)

const showSnackbar = ref(false)
const snackbarMessage = ref('')
const snackbarColor = ref('success')
const snackbarIcon = ref('mdi-check-circle')

const router = useRouter()

function showMessage(message, color = 'success', icon = 'mdi-check-circle') {
  snackbarMessage.value = message
  snackbarColor.value = color
  snackbarIcon.value = icon
  showSnackbar.value = true
}

async function fetchSettings() {
  try {
    const { data: admin, error } = await supabase
      .from('users')
      .select('id, name, status')
      .eq('role', 'Admin')
      .single()
    
    if (error) {
      console.error('Error fetching admin profile:', error)
      showMessage('Failed to load settings', 'error', 'mdi-alert-circle')
      return
    }

    if (admin) {
      adminProfile.value.id = admin.id
      adminProfile.value.name = admin.name ?? ''
      adminProfile.value.active = admin.status !== 'Inactive'
    }
  } catch (err) {
    console.error('Unexpected error:', err)
    showMessage('An unexpected error occurred', 'error', 'mdi-alert-circle')
  }
}

async function updateProfile() {
  if (!adminProfile.value.name.trim()) {
    showMessage('Please enter a valid name', 'warning', 'mdi-alert-circle')
    return
  }

  profileLoading.value = true
  try {
    const { error } = await supabase
      .from('users')
      .update({
        name: adminProfile.value.name,
        status: adminProfile.value.active ? 'Active' : 'Inactive'
      })
      .eq('id', adminProfile.value.id)

    if (error) {
      showMessage(`Failed to update profile: ${error.message}`, 'error', 'mdi-alert-circle')
    } else {
      showMessage('Profile updated successfully!', 'success', 'mdi-check-circle')
      await fetchSettings()
    }
  } catch (err) {
    showMessage('An error occurred while updating profile', 'error', 'mdi-alert-circle')
  } finally {
    profileLoading.value = false
  }
}

async function updatePassword() {
  if (!passwords.value.newPassword || !passwords.value.confirmPassword) {
    showMessage('Please fill in all password fields', 'warning', 'mdi-alert-circle')
    return
  }

  if (passwords.value.newPassword !== passwords.value.confirmPassword) {
    showMessage('New password and confirmation do not match', 'warning', 'mdi-alert-circle')
    return
  }

  if (passwords.value.newPassword.length < 8) {
    showMessage('Password must be at least 8 characters long', 'warning', 'mdi-alert-circle')
    return
  }

  passwordLoading.value = true
  try {
    const { error } = await supabase.auth.updateUser({
      password: passwords.value.newPassword
    })

    if (error) {
      showMessage(`Failed to update password: ${error.message}`, 'error', 'mdi-alert-circle')
    } else {
      showMessage('Password updated successfully!', 'success', 'mdi-check-circle')
      passwords.value = { current: '', newPassword: '', confirmPassword: '' }
    }
  } catch (err) {
    showMessage('An error occurred while updating password', 'error', 'mdi-alert-circle')
  } finally {
    passwordLoading.value = false
  }
}

onMounted(fetchSettings)
</script>

<style scoped>
.settings-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
}

.settings-card {
  border-radius: 16px;
  border: 1px solid rgba(0, 0, 0, 0.06);
  background: linear-gradient(145deg, #ffffff 0%, #fafafa 100%);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.settings-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.1);
}

h1, h2 {
  font-family: 'Avenir', system-ui, sans-serif;
  font-weight: 700;
  letter-spacing: -0.02em;
}

@media (max-width: 960px) {
  .settings-header {
    flex-direction: column;
    align-items: flex-start;
  }
}

:deep(.v-divider) {
  border-color: rgba(0, 0, 0, 0.06);
}
</style>
