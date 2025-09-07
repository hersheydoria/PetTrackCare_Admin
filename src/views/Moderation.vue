<template>
  <v-container class="py-6">
    <h1>Community Post Moderation</h1>
    <v-row class="mb-4">
      <v-col cols="12" sm="6" md="4">
        <v-select :items="filters" label="Filter" v-model="selectedFilter" />
      </v-col>
    </v-row>
    <v-data-table :headers="headers" :items="filteredPosts" class="mt-4 moderation-table" item-key="id" hide-default-footer>
      <template #item.actions="{ item }">
        <v-btn size="small" color="deepRed" class="action-btn" @click="hidePost(item.id)">Hide</v-btn>
        <v-btn size="small" color="lightBlush" class="action-btn" @click="deletePost(item.id)">Delete</v-btn>
      </template>
    </v-data-table>
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { supabase } from '../supabase.js'

const filters = ['All', 'Reported']
const selectedFilter = ref('All')
const headers = [
  { title: 'Preview', value: 'preview' },
  { title: 'Date', value: 'date' },
  { title: 'Status', value: 'status' },
  { title: 'Actions', value: 'actions', sortable: false },
]

const posts = ref([])

async function fetchPosts() {
  const { data, error } = await supabase
    .from('community_posts')
    .select('id, content, created_at, reported')
    .order('created_at', { ascending: false })
  posts.value = (data || []).map(post => ({
    id: post.id,
    preview: post.content?.slice(0, 40) ?? '',
    date: post.created_at?.slice(0, 10) ?? '',
    status: post.reported ? 'Reported' : 'Normal'
  }))
}

async function hidePost(id) {
  await supabase
    .from('community_posts')
    .update({ reported: false })
    .eq('id', id)
  await fetchPosts()
}

async function deletePost(id) {
  await supabase
    .from('community_posts')
    .delete()
    .eq('id', id)
  await fetchPosts()
}

// Filtering logic: returns filtered posts based on selection
const filteredPosts = computed(() => {
  if (selectedFilter.value === 'All') return posts.value
  if (selectedFilter.value === 'Reported') return posts.value.filter(p => p.status === 'Reported')
  return posts.value
})

onMounted(fetchPosts)
</script>

<style scoped>
.moderation-table >>> tbody tr {
  transition: background 0.2s;
}
.moderation-table >>> tbody tr:hover {
  background: #F6DED8;
}
.moderation-table >>> tbody tr.active-row {
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