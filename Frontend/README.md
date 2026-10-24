# Platter

Food delivery app: React 19, Vite, Tailwind CSS v4, React Router.

## Run

```bash
npm install
npm run dev
```

Open http://localhost:5173 and pick a city.

## Features
- City picker (with "use my location"), restaurants per city, filters and sorting
- Search across restaurants and dishes
- Menu with veg filter, rating badges, cart drawer, promo codes (PLATTER50, FREESHIP)
- Login/register, checkout, order tracking, reorder (all client-side, localStorage)

Backend swap points: `getOrders`/`addOrder` in `src/orders.js` and the four functions in `src/context/AuthContext.jsx`.
