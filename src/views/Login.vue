<template>
  <div class="login-bg">
    <div class="login-center">
      <v-card class="pa-8 login-card" max-width="420">
        <template v-if="isCheckingSession">
          <v-row align="center" justify="center" style="height:200px;">
            <v-progress-circular indeterminate color="deepRed" size="48" />
          </v-row>
        </template>
        <template v-else>
          <v-row justify="center">
            <img src="../assets/logo.png" alt="Logo" style="height:120px;" />
          </v-row>
            <h2 class="mt-4 mb-2 login-title">PetTrackCare Admin Login</h2>
          <v-form>
              <v-text-field v-model="email" label="Email" prepend-icon="mdi-email" type="email" class="mb-4 no-underline" :rules="emailRules" variant="solo" color="deepRed" rounded />
              <v-text-field v-model="password" :type="showPassword ? 'text' : 'password'" label="Password" prepend-icon="mdi-lock" :append-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'" @click:append="showPassword = !showPassword" class="mb-4 no-underline" :rules="passwordRules" variant="solo" color="deepRed" rounded />
            <v-btn :loading="isLoading" color="deepRed" block class="mt-4 login-btn" @click="login">Login</v-btn>
          </v-form>
        </template>
      </v-card>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { supabase } from '../supabase'

const isCheckingSession = ref(false)
const isLoading = ref(false)
const showPassword = ref(false)
const email = ref('')
const password = ref('')
const emailRules = [
  v => !!v || 'Email is required',
  v => /.+@.+\..+/.test(v) || 'Enter a valid email address',
]
const passwordRules = [
  v => !!v || 'Password is required',
  v => v.length >= 6 || 'Password must be at least 6 characters',
]

// 🔹 LOGIN for existing admin
async function login() {
  isLoading.value = true
  const { data, error } = await supabase.auth.signInWithPassword({
    email: email.value,
    password: password.value,
  })
  if (error) {
    isLoading.value = false
    alert(error.message)
    return
  }
  const userId = data.user?.id
  if (!userId) {
    isLoading.value = false
    alert('No user found')
    return
  }
  // check role in public.users
  const { data: userRows, error: userError } = await supabase
    .from('users')
    .select('role')
    .eq('id', userId)
    .single()
  if (userError || !userRows || userRows.role !== 'Admin') {
    isLoading.value = false
    alert('Access denied: Only Admins can log in.')
    await supabase.auth.signOut()
    return
  }
  localStorage.setItem('isLoggedIn', 'true')
  isLoading.value = false
  window.location.href = '/'
}
</script>

<style scoped>
.login-title {
  text-align: center;
  color: #B82132;
  font-family: 'Avenir', system-ui, sans-serif;
  font-weight: 700;
  font-size: 22px;
}
.no-underline >>> .v-input__control {
  border-bottom: none !important;
}
.login-bg {
  min-height: 100vh;
  width: 100vw;
  background: #F6DED8;
  display: flex;
  align-items: center;
  justify-content: center;
}
.login-center {
  width: 100%;
  max-width: 420px;
  margin: auto;
  display: flex;
  align-items: center;
  justify-content: center;
}
.login-card {
  border-radius: 20px;
  background: #fff;
  box-shadow: 0 6px 24px rgba(0,0,0,0.12);
  transition: box-shadow 0.2s, transform 0.2s;
  width: 100%;
  max-width: 420px;
}
.login-card:hover {
  box-shadow: 0 12px 32px rgba(184,33,50,0.18);
  transform: translateY(-2px) scale(1.02);
}
.login-btn {
  padding: 14px 0;
  font-size: 16px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(184,33,50,0.10);
  transition: box-shadow 0.2s, background 0.2s;
}
.login-btn:hover {
  background: #ECA1A6 !important;
  box-shadow: 0 4px 16px rgba(184,33,50,0.18);
}
</style>
