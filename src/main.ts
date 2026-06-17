import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from '@/App.vue';
import { router } from '@/router';
import { installMock } from '@/mock';
import { i18n, setLocale } from '@/i18n';
import { useUiPrefsStore } from '@/stores/useUiPrefsStore';
import '@/styles/main.scss';

// No real backend: mount the localStorage-backed mock API on the shared Axios instance.
installMock();

const app = createApp(App);
const pinia = createPinia();

app.use(pinia);
app.use(i18n);
app.use(router);

// Apply the persisted locale before the first render.
setLocale(useUiPrefsStore().locale);

app.mount('#app');
