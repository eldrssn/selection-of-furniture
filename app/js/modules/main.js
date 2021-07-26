/* global L:readonly */
const map = L.map('map')
  .setView({
    lat: 55.713669,
    lng: 37.573169,
  }, 15);

L.tileLayer(
  'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
  {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  },
).addTo(map)

const marker = L.marker(
  {
    lat: 55.713669,
    lng: 37.573169,
  },
).addTo(map);

