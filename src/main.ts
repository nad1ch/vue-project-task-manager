import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from '@/App.vue';
import { router } from '@/router';
import { installMock } from '@/mock';
import '@/styles/main.scss';

// No real backend: mount the localStorage-backed mock API on the shared Axios instance.
installMock();

const app = createApp(App);

app.use(createPinia());
app.use(router);

app.mount('#app');
