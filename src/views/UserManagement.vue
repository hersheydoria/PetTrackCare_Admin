<template>
  <v-container class="py-8 px-6">
    <div class="user-header mb-8">
      <div>
        <h1 class="text-h3 font-weight-bold mb-2">User Management</h1>
        <p class="text-subtitle-1 text-medium-emphasis">Manage platform users, roles, and account status</p>
      </div>
      <div class="d-flex align-center gap-3">
        <v-chip 
          color="primary" 
          size="large"
          prepend-icon="mdi-account-multiple"
          class="px-4"
        >
          {{ users.length }} Users
        </v-chip>
      </div>
    </div>

    <v-card class="user-card" elevation="0">
      <v-data-table 
        :headers="headers" 
        :items="users" 
        class="user-table" 
        item-key="id"
        :items-per-page="10"
      >
        <template #item.name="{ item }">
          <div class="d-flex align-center">
            <v-avatar 
              :color="item.role === 'Pet Owner' ? 'ownerColor' : 'sitterColor'" 
              size="40" 
              class="mr-3"
              :image="item.profile_picture"
            >
              <v-icon v-if="!item.profile_picture" color="white" size="small">
                {{ item.role === 'Pet Owner' ? 'mdi-home-account' : 'mdi-hand-helping' }}
              </v-icon>
            </v-avatar>
            <div>
              <div class="font-weight-medium">{{ item.name }}</div>
              <div class="text-caption text-medium-emphasis">ID: {{ item.id.substring(0, 8) }}...</div>
            </div>
          </div>
        </template>

        <template #item.role="{ item }">
          <v-chip 
            :color="item.role === 'Pet Owner' ? 'ownerColor' : 'sitterColor'" 
            size="small"
            variant="flat"
            text-color="white"
          >
            {{ item.role }}
          </v-chip>
        </template>

        <template #item.status="{ item }">
          <v-chip 
            :color="item.status === 'Active' ? 'success' : 'warning'" 
            size="small"
            variant="tonal"
            :prepend-icon="item.status === 'Active' ? 'mdi-check-circle' : 'mdi-alert-circle'"
          >
            {{ item.status }}
          </v-chip>
        </template>

        <template #item.actions="{ item }">
          <div class="action-buttons">
            <v-btn 
              size="small" 
              color="primary" 
              variant="tonal"
              prepend-icon="mdi-pencil"
              @click="openEditDialog(item)"
            >
              Edit
            </v-btn>
            <v-btn
              size="small"
              :color="item.status === 'Inactive' ? 'success' : 'warning'"
              :variant="item.status === 'Inactive' ? 'flat' : 'tonal'"
              :prepend-icon="item.status === 'Inactive' ? 'mdi-check' : 'mdi-pause'"
              @click="toggleUserStatus(item)"
            >
              {{ item.status === 'Inactive' ? 'Activate' : 'Deactivate' }}
            </v-btn>
            <v-btn 
              size="small" 
              color="deepRed" 
              variant="tonal"
              prepend-icon="mdi-delete"
              @click="openDeleteDialog(item)"
            >
              Delete
            </v-btn>
          </div>
        </template>

        <template #no-data>
          <div class="text-center py-12">
            <v-icon size="80" color="primary" class="mb-4">mdi-account-multiple-outline</v-icon>
            <h3 class="text-h6 mb-2">No Users Found</h3>
            <p class="text-body-2 text-medium-emphasis">No user accounts to display</p>
          </div>
        </template>
      </v-data-table>
    </v-card>

    <!-- Edit Dialog -->
    <v-dialog v-model="editDialog" max-width="500">
      <v-card class="pa-6">
        <v-card-title class="d-flex align-center pa-0 mb-6">
          <v-icon color="primary" class="mr-3" size="large">mdi-account-edit</v-icon>
          <span class="text-h6">Edit User</span>
        </v-card-title>
        <v-card-text class="pa-0">
          <v-text-field 
            v-model="editUser.name" 
            label="Full Name" 
            density="comfortable"
            prepend-inner-icon="mdi-account"
            variant="outlined"
            class="mb-4"
          />
          <v-select
            v-model="editUser.role"
            :items="['Pet Owner', 'Pet Sitter']"
            label="Role"
            density="comfortable"
            prepend-inner-icon="mdi-briefcase"
            variant="outlined"
          />
        </v-card-text>
        <v-card-actions class="pa-0 pt-6">
          <v-spacer></v-spacer>
          <v-btn 
            color="grey" 
            variant="text"
            @click="editDialog = false"
          >
            Cancel
          </v-btn>
          <v-btn 
            color="primary" 
            variant="flat"
            prepend-icon="mdi-check"
            @click="saveEdit"
          >
            Save Changes
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Delete Confirmation Dialog -->
    <v-dialog v-model="deleteDialog" max-width="500">
      <v-card class="pa-6">
        <v-card-title class="d-flex align-center pa-0 mb-4">
          <v-icon color="error" class="mr-3" size="large">mdi-alert-circle</v-icon>
          <span class="text-h6">Delete User</span>
        </v-card-title>
        <v-card-text class="pa-0 mb-6">
          <p class="text-body-1 mb-3">
            Are you sure you want to delete <strong>{{ deleteUserName }}</strong>?
          </p>
          <v-alert type="warning" variant="tonal">
            This action will permanently remove the user account and cannot be undone.
          </v-alert>
        </v-card-text>
        <v-card-actions class="pa-0">
          <v-spacer></v-spacer>
          <v-btn 
            color="grey" 
            variant="text"
            @click="deleteDialog = false"
          >
            Cancel
          </v-btn>
          <v-btn 
            color="error" 
            variant="flat"
            prepend-icon="mdi-delete"
            @click="confirmDelete"
          >
            Delete User
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Status Snackbar -->
    <v-snackbar
      v-model="snackbar"
      :color="snackbarColor"
      :timeout="3000"
      location="top"
    >
      <div class="d-flex align-center">
        <v-icon class="mr-2">{{ snackbarIcon }}</v-icon>
        {{ snackbarText }}
      </div>
    </v-snackbar>
  </v-container>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import {
  fetchPlatformUsers,
  updatePlatformUser,
  deletePlatformUser
} from '../apiClient.js'

const headers = [
  { title: 'Name', value: 'name', width: '250px' },
  { title: 'Role', value: 'role', width: '150px' },
  { title: 'Status', value: 'status', width: '120px' },
  { title: 'Actions', value: 'actions', sortable: false, width: '350px' },
]

const users = ref([])
const editDialog = ref(false)
const deleteDialog = ref(false)
const editUser = ref({ id: '', name: '', role: '' })
const deleteUserName = ref('')
const deleteUserId = ref('')
const snackbar = ref(false)
const snackbarText = ref('')
const snackbarColor = ref('success')
const snackbarIcon = ref('mdi-check-circle')

function showSnackbar(text, color = 'success', icon = 'mdi-check-circle') {
  snackbarText.value = text
  snackbarColor.value = color
  snackbarIcon.value = icon
  snackbar.value = true
}

async function fetchUsers() {
  try {
    const data = await fetchPlatformUsers()
    users.value = (data || []).map(u => ({
      id: u.id,
      name: u.name || 'Unknown',
      email: u.email || '',
      role: u.role || 'Pet Owner',
      status: u.status ?? 'Active',
      profile_picture: u.profile_picture || null
    }))
  } catch (error) {
    console.error('Error fetching users:', error)
    showSnackbar('Failed to load users', 'error', 'mdi-alert-circle')
    users.value = []
  }
}

async function toggleUserStatus(user) {
  const newStatus = user.status === 'Inactive' ? 'Active' : 'Inactive'
  try {
    await updatePlatformUser(user.id, { status: newStatus })
    showSnackbar(`User ${newStatus === 'Active' ? 'activated' : 'deactivated'} successfully`, 'success', 'mdi-check-circle')
  } catch (error) {
    console.error('Error updating user status:', error)
    showSnackbar('Failed to update user status', 'error', 'mdi-alert-circle')
  }
  await fetchUsers()
}

async function saveEdit() {
  try {
    await updatePlatformUser(editUser.value.id, {
      name: editUser.value.name,
      role: editUser.value.role
    })
    showSnackbar('User updated successfully', 'success', 'mdi-check-circle')
  } catch (error) {
    console.error('Error updating user:', error)
    showSnackbar('Failed to update user', 'error', 'mdi-alert-circle')
  }
  editDialog.value = false
  await fetchUsers()
}

function openDeleteDialog(user) {
  deleteUserId.value = user.id
  deleteUserName.value = user.name
  deleteDialog.value = true
}

async function confirmDelete() {
  try {
    await deletePlatformUser(deleteUserId.value)
    showSnackbar('User deleted successfully', 'success', 'mdi-check-circle')
  } catch (error) {
    console.error('Error deleting user:', error)
    showSnackbar('Failed to delete user', 'error', 'mdi-alert-circle')
  }
  deleteDialog.value = false
  await fetchUsers()
}

onMounted(fetchUsers)
</script>

<style scoped>
.user-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
}

.user-card {
  border-radius: 16px;
  border: 1px solid rgba(0, 0, 0, 0.06);
  overflow: hidden;
}

.user-table {
  background: transparent;
}

.user-table :deep(thead) {
  background: linear-gradient(145deg, #fafafa 0%, #f5f5f5 100%);
}

.user-table :deep(thead th) {
  font-weight: 600 !important;
  color: #424242 !important;
  text-transform: uppercase;
  font-size: 0.75rem;
  letter-spacing: 0.05em;
}

.user-table :deep(tbody tr) {
  transition: all 0.2s ease;
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
}

.user-table :deep(tbody tr:hover) {
  background: #FFF3F0 !important;
  transform: scale(1.01);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.user-table :deep(tbody td) {
  padding: 16px 12px !important;
}

.action-buttons {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

h1 {
  font-family: 'Avenir', system-ui, sans-serif;
  font-weight: 700;
  letter-spacing: -0.02em;
}

@media (max-width: 960px) {
  .user-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .action-buttons {
    flex-direction: column;
    width: 100%;
  }

  .action-buttons > * {
    width: 100%;
  }
}

:deep(.v-table__wrapper) {
  overflow: hidden;
}
</style>
