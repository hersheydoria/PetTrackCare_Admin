const BASE_URL = (import.meta.env.VITE_FASTAPI_BASE_URL || '').replace(/\/$/, '')

function appendQuery(path, params) {
  if (!params) return path
  const query = new URLSearchParams()
  Object.keys(params).forEach(key => {
    const value = params[key]
    if (value !== undefined && value !== null) {
      query.append(key, value)
    }
  })
  const queryString = query.toString()
  return queryString ? `${path}?${queryString}` : path
}

async function request(path, { method = 'GET', params, body } = {}) {
  if (!BASE_URL) {
    throw new Error('VITE_FASTAPI_BASE_URL is not set in the environment')
  }

  const url = `${BASE_URL}${appendQuery(path, params)}`
  const headers = {
    'Content-Type': 'application/json'
  }
  const token = localStorage.getItem('pettrackcare_admin_token')
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const response = await fetch(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined
  })

  const text = await response.text()
  const data = text ? JSON.parse(text) : null

  if (!response.ok) {
    const message = data?.detail || data?.message || response.statusText
    throw new Error(message)
  }

  return data
}

export async function fetchModerationReports() {
  const data = await request('/admin/reports')
  return data.reports || data
}

export async function authenticateAdmin(credentials) {
  return request('/admin/login', {
    method: 'POST',
    body: credentials
  })
}

export async function fetchDashboardStats() {
  const data = await request('/admin/dashboard/stats')
  return data.stats || data
}

export async function fetchSystemHealth() {
  return request('/admin/health')
}

export async function deleteModerationReport(reportId) {
  await request(`/admin/reports/${reportId}`, { method: 'DELETE' })
}

export async function deleteCommunityPost(postId) {
  await request(`/admin/posts/${postId}`, { method: 'DELETE' })
}

export async function fetchPlatformUsers() {
  const data = await request('/admin/users', { params: { exclude_role: 'Admin' } })
  return data.users || data
}

export async function updatePlatformUser(userId, payload) {
  await request(`/admin/users/${userId}`, {
    method: 'PATCH',
    body: payload
  })
}

export async function deletePlatformUser(userId) {
  await request(`/admin/users/${userId}`, { method: 'DELETE' })
}

export async function fetchFeedbackReports() {
  const data = await request('/admin/feedback')
  return data.feedback || data
}

export async function updateFeedbackStatus(feedbackId, payload) {
  await request(`/admin/feedback/${feedbackId}`, {
    method: 'PATCH',
    body: payload
  })
}

export async function respondToFeedback(feedbackId, payload) {
  return request(`/admin/feedback/${feedbackId}/response`, {
    method: 'POST',
    body: payload
  })
}

export async function fetchAdminProfile() {
  const data = await request('/admin/profile')
  return data.profile || data
}

export async function updateAdminProfile(payload) {
  await request('/admin/profile', {
    method: 'PATCH',
    body: payload
  })
}

export async function updateAdminPassword(payload) {
  await request('/admin/profile/password', {
    method: 'POST',
    body: payload
  })
}

export async function fetchUsageMetrics(role) {
  const params = {}
  if (role) {
    params.role = role
  }
  const data = await request('/admin/usage', { params })
  return data.metrics || data
}
