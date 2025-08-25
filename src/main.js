import { createApp } from 'vue'
import App from './App.vue'
import { createVuetify } from 'vuetify'
import 'vuetify/styles'
import { aliases, mdi } from 'vuetify/iconsets/mdi'
import '@mdi/font/css/materialdesignicons.css'
import router from './router'

const vuetify = createVuetify({
	theme: {
		defaultTheme: 'customTheme',
		themes: {
			customTheme: {
				dark: false,
				colors: {
					deepRed: '#B82132',
					lightBlush: '#F6DED8',
					ownerColor: '#ECA1A6',
					sitterColor: '#F2B28C',
					primary: '#B82132',
					secondary: '#F6DED8',
				},
			},
		},
	},
	icons: {
		defaultSet: 'mdi',
		aliases,
		sets: { mdi },
	},
})

const app = createApp(App)
app.use(vuetify)
app.use(router)
app.mount('#app')
