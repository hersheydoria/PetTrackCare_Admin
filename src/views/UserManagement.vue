<template>
  <v-container class="py-6">
    <h1>User Account Management</h1>
    <v-data-table :headers="headers" :items="users" class="mt-4 user-table" item-key="id" hide-default-footer>
      <template #item.actions="{ item }">
        <v-btn size="small" color="primary" class="action-btn" @click="openEditDialog(item)">Edit</v-btn>
        <v-btn
          size="small"
          :color="item.status === 'Inactive' ? 'success' : 'sitterColor'"
          class="action-btn"
          @click="toggleUserStatus(item)"
        >
          {{ item.status === 'Inactive' ? 'Activate' : 'Deactivate' }}
        </v-btn>
        <v-btn size="small" color="deepRed" class="action-btn" @click="deleteUser(item.id)">Delete</v-btn>
      </template>
    </v-data-table>

    <v-dialog v-model="editDialog" max-width="400">
      <v-card>
        <v-card-title>Edit User</v-card-title>
        <v-card-text>
          <v-text-field v-model="editUser.name" label="Name" />
          <v-select
            v-model="editUser.role"
            :items="['Pet Owner', 'Pet Sitter']"
            label="Role"
          />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn color="primary" @click="saveEdit">Save</v-btn>
          <v-btn color="grey" @click="editDialog = false">Cancel</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from '../supabase.js'

const headers = [
  { title: 'Name', value: 'name' },
  { title: 'Role', value: 'role' },
  { title: 'Status', value: 'status' },
  { title: 'Actions', value: 'actions', sortable: false },
]

const users = ref([])
const editDialog = ref(false)
const editUser = ref({ id: '', name: '', role: '' })

async function fetchUsers() {
  const { data, error } = await supabase
    .from('users')
    .select('id, name, role, status')
    .neq('role', 'Admin')
  users.value = (data || []).map(u => ({
    id: u.id,
    name: u.name,
    role: u.role,
    status: u.status ?? 'Active'
  }))
}

async function toggleUserStatus(user) {
  const newStatus = user.status === 'Inactive' ? 'Active' : 'Inactive'
  await supabase
    .from('users')
    .update({ status: newStatus })
    .eq('id', user.id)
  await fetchUsers()
}

function openEditDialog(user) {
  editUser.value = { ...user }
  editDialog.value = true
}

async function saveEdit() {
  await supabase
    .from('users')
    .update({
      name: editUser.value.name,
      role: editUser.value.role
    })
    .eq('id', editUser.value.id)
  editDialog.value = false
  await fetchUsers()
}

async function deleteUser(id) {
  await supabase
    .from('users')
    .delete()
    .eq('id', id)
  await fetchUsers()
}

onMounted(fetchUsers)
</script>

<style scoped>
.user-table >>> tbody tr {
  transition: background 0.2s;
}
.user-table >>> tbody tr:hover {
  background: #F6DED8;
}
.user-table >>> tbody tr.active-row {
  background: #ECA1A6;
}
.action-btn {
  margin-right: 8px;
}
.action-btn:last-child {
  margin-right: 0;
}
h1 {
  font-family: 'Avenir', system-ui, sans-serif;
  font-weight: 700;
}
</style>
