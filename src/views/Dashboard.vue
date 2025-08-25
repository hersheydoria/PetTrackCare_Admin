<template>
  <v-container class="py-6">
    <h1 class="mb-6">Admin Dashboard</h1>
    <v-row>
      <v-col cols="12" sm="6" md="3">
  <v-card color="ownerColor" class="pa-4 dashboard-card">
          <h2>Total Active Users</h2>
          <div class="text-h4">1,234</div>
        </v-card>
      </v-col>
      <v-col cols="12" sm="6" md="3">
  <v-card color="sitterColor" class="pa-4 dashboard-card">
          <h2>Posts This Week</h2>
          <div class="text-h4">56</div>
        </v-card>
      </v-col>
      <v-col cols="12" sm="6" md="3">
  <v-card color="deepRed" class="pa-4 dashboard-card">
          <h2>Lost Pet Alerts</h2>
          <div class="text-h4">7</div>
        </v-card>
      </v-col>
      <v-col cols="12" sm="6" md="3">
  <v-card color="lightBlush" class="pa-4 dashboard-card">
          <h2>Flagged Posts</h2>
          <div class="text-h4">3</div>
        </v-card>
      </v-col>
    </v-row>

    <v-row class="mt-8">
      <v-col cols="12" md="6">
  <v-card class="pa-4 dashboard-card">
          <h2>System Health</h2>
          <v-list>
            <v-list-item title="API Status" subtitle="Online" prepend-icon="mdi-check-circle" />
            <v-list-item title="Database" subtitle="Healthy" prepend-icon="mdi-database" />
            <v-list-item title="Storage" subtitle="OK" prepend-icon="mdi-cloud-check" />
          </v-list>
        </v-card>
      </v-col>
      <v-col cols="12" md="6">
  <v-card class="pa-4 dashboard-card">
          <h2>Flagged Posts</h2>
          <v-list>
            <v-list-item title="Post #123" subtitle="Flagged for review" />
            <v-list-item title="Post #124" subtitle="Reported by user" />
            <v-list-item title="Post #125" subtitle="Flagged for inappropriate content" />
          </v-list>
          <v-btn color="deepRed" class="mt-4" to="/moderation">Go to Moderation</v-btn>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
// Add logic to fetch real stats and flagged posts here
</script>

<style scoped>
.dashboard-card {
  border-radius: 18px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.08);
  transition: box-shadow 0.2s, transform 0.2s;
}
.dashboard-card:hover {
  box-shadow: 0 4px 24px rgba(184,33,50,0.18);
  transform: translateY(-2px) scale(1.02);
}
h1, h2 {
  font-family: 'Avenir', system-ui, sans-serif;
  font-weight: 700;
}
</style>
