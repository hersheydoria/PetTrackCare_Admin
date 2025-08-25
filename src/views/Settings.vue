<template>
  <v-container class="py-6">
    <h1>Settings</h1>
    <v-row>
      <v-col cols="12" md="6">
        <v-card class="pa-4 settings-card mb-4">
          <h2>Admin Profile</h2>
          <v-text-field label="Name" value="Admin" prepend-icon="mdi-account" />
          <v-text-field label="Email" value="admin@pettrackcare.com" prepend-icon="mdi-email" />
          <v-btn color="primary" class="mt-2">Update Profile</v-btn>
        </v-card>
        <v-card class="pa-4 settings-card mb-4">
          <h2>Notification Preferences</h2>
          <v-switch label="Email Alerts" color="deepRed" />
          <v-switch label="System Health Notifications" color="ownerColor" />
        </v-card>
      </v-col>
      <v-col cols="12" md="6">
        <v-card class="pa-4 settings-card mb-4">
          <h2>Platform Configuration</h2>
          <v-select :items="['Open', 'Maintenance', 'Closed']" label="Platform Status" />
          <v-btn color="deepRed" class="mt-2">Save Changes</v-btn>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
// Add logic for updating settings here
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
