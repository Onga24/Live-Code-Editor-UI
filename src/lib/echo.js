import Echo from "laravel-echo";
import Pusher from "pusher-js";
import axiosInstance from "./axios";

window.Pusher = Pusher;

const token = localStorage.getItem("token");

// Debug environment variables
console.log('Environment variables:', {
    key: import.meta.env.VITE_REVERB_APP_KEY,
    host: import.meta.env.VITE_REVERB_HOST,
    port: import.meta.env.VITE_REVERB_PORT,
    scheme: import.meta.env.VITE_REVERB_SCHEME
});

window.Echo = new Echo({
    broadcaster: "reverb",
    key: import.meta.env.VITE_REVERB_APP_KEY, // أو مفتاح وهمي لو Reverb
    wsHost: import.meta.env.VITE_REVERB_HOST || "127.0.0.1",
    wsPort: import.meta.env.VITE_REVERB_PORT || 8080,       // المنفذ اللي شغال عليه reverb أو soketi
    wssPort: import.meta.env.VITE_REVERB_PORT || 8080,  
    forceTLS: false, //(import.meta.env.VITE_REVERB_SCHEME ?? 'http') === 'https'
    disableStats: true,
    enabledTransports: ["ws"],
    authorizer: (channel, options) => {
        return {
            authorize: (socketId, callback) => {
                axiosInstance.post("/broadcasting/auth", {
                    socket_id: socketId,
                    channel_name: channel.name,
                })
                .then(response => {
                    callback(false, response.data);
                })
                .catch(error => {
                    callback(true, error);
                });
            }
        };
    },
});


// import Echo from 'laravel-echo';
// import Pusher from 'pusher-js';

// window.Pusher = Pusher;

// console.log("Initializing Echo...");
// console.log(localStorage.getItem('token'));

// window.Echo = new Echo({
//     broadcaster: 'reverb',
//     key: import.meta.env.VITE_REVERB_APP_KEY,
//     wsHost: import.meta.env.VITE_REVERB_HOST,
//     wsPort: import.meta.env.VITE_REVERB_PORT ?? 8080,
//     wssPort: import.meta.env.VITE_REVERB_PORT ?? 443,
//     forceTLS: (import.meta.env.VITE_REVERB_SCHEME ?? 'http') === 'https',
//     enabledTransports: ['ws', 'wss'],
//     authEndpoint: 'http://127.0.0.1:8000/api/broadcasting/auth',
//     auth: {
//         headers: {
//             Authorization: `Bearer ${localStorage.getItem('token')}`,
//             'Content-Type': 'application/json',
//             'Accept': 'application/json',
//         },
//     },
// });

// window.Echo = new Echo({
//     broadcaster: 'reverb',
//     key: import.meta.env.VITE_REVERB_APP_KEY,
//     wsHost: import.meta.env.VITE_REVERB_HOST,
//     wsPort: import.meta.env.VITE_REVERB_PORT ?? 8080,
//     wssPort: import.meta.env.VITE_REVERB_PORT ?? 443,
//     forceTLS: (import.meta.env.VITE_REVERB_SCHEME ?? 'http') === 'https',
//     enabledTransports: ['ws', 'wss'],
//     // تأكد من المسار الصحيح للتوثيق
//     authEndpoint: 'http://127.0.0.1:8000/api/broadcasting/auth',
//     // authEndpoint: 'http://127.0.0.1:8000/broadcasting/auth',
//     auth: {
//         headers: {
//             Authorization: `Bearer ${localStorage.getItem('token')}`,
//             'Content-Type': 'application/json',
//             'Accept': 'application/json',
//         },
//     },
//     // إعدادات إضافية للتشخيص
//     enableLogging: true,
// });

// للتشخيص
window.Echo.connector.pusher.connection.bind('connected', () => {
    console.log('✅ Echo connected successfully');
});

window.Echo.connector.pusher.connection.bind('disconnected', () => {
    console.log('❌ Echo disconnected');
});

window.Echo.connector.pusher.connection.bind('error', (error) => {
    console.error('Echo connection error:', error);
});

// import Echo from 'laravel-echo';
// import Pusher from 'pusher-js';

// window.Pusher = Pusher;

// console.log("in echo");
// console.log(localStorage.getItem('token'));
// window.Echo = new Echo({
//     broadcaster: 'reverb',
//     key: import.meta.env.VITE_REVERB_APP_KEY,
//     wsHost: import.meta.env.VITE_REVERB_HOST,
//     wsPort: import.meta.env.VITE_REVERB_PORT ?? 80,
//     wssPort: import.meta.env.VITE_REVERB_PORT ?? 443,
//     forceTLS: (import.meta.env.VITE_REVERB_SCHEME ?? 'https') === 'https',
//     enabledTransports: ['ws', 'wss'],
//     // authEndpoint: 'http://127.0.0.1:8000/api/broadcasting/auth',
//     authEndpoint: 'http://127.0.0.1:8000/broadcasting/auth',
//     auth: {
//         headers: {
//             Authorization: `Bearer ${localStorage.getItem('token')}`,
//         },
//     },
// });