<script setup lang="ts">
definePageMeta({ layout: false })
useHead({ title: '登录 · 光屿' })

const { loggedIn, fetch: refreshSession } = useUserSession()

onMounted(() => {
  if (loggedIn.value) navigateTo('/admin')
})

const username = ref('')
const password = ref('')
const errorMsg = ref('')
const submitting = ref(false)

async function submit() {
  if (submitting.value) return
  errorMsg.value = ''
  submitting.value = true
  try {
    await $fetch('/api/auth/login', {
      method: 'POST',
      body: { username: username.value, password: password.value },
    })
    await refreshSession()
    await navigateTo('/admin')
  } catch (err: any) {
    errorMsg.value = err?.statusMessage || err?.data?.statusMessage || '登录失败，请重试'
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <div class="login">
    <div class="bg-decor" aria-hidden="true">
      <div class="bg-orb bg-orb--cyan" />
      <div class="bg-orb bg-orb--violet" />
    </div>

    <form class="login-card" @submit.prevent="submit">
      <p class="login-kicker">LUMALOG ADMIN</p>
      <h1 class="login-title">光屿 · 后台</h1>

      <label class="field-label" for="u">账号</label>
      <input id="u" v-model="username" class="input" autocomplete="username" required>

      <label class="field-label login-gap" for="p">密码</label>
      <input id="p" v-model="password" type="password" class="input" autocomplete="current-password" required>

      <p v-if="errorMsg" class="login-error">{{ errorMsg }}</p>

      <button class="btn btn-primary login-submit" type="submit" :disabled="submitting">
        {{ submitting ? '登录中…' : '登录' }}
      </button>
    </form>
  </div>
</template>

<style scoped>
.login {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
}

.login-card {
  width: min(360px, 100%);
  padding: 2.2rem 2rem;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--r-lg);
  box-shadow: var(--shadow-card);
  backdrop-filter: blur(10px);
}

.login-kicker {
  margin: 0 0 0.3rem;
  font-size: 0.72rem;
  letter-spacing: 0.35em;
  color: var(--text-3);
  text-align: center;
}

.login-title {
  margin: 0 0 1.6rem;
  font-size: 1.35rem;
  font-weight: 700;
  text-align: center;
  letter-spacing: 0.08em;
}

.login-gap {
  margin-top: 0.9rem;
}

.login-error {
  margin: 0.8rem 0 0;
  font-size: 0.85rem;
  color: #e5484d;
  text-align: center;
}

.login-submit {
  width: 100%;
  margin-top: 1.4rem;
}
</style>
