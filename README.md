# Future Nature - Vizsgaremek

Ez egy interaktív, környezettudatosságra nevelő oktatási platform, amely a **Budapesti Műszaki SzC Petrik Lajos Két tanítási Nyelvű Technikum** záró vizsgaremekeként készült.

**Készítették:** Tóth Patrik és Galambos Gergő

## Technológiai specifikáció

- **Frontend:** React (TypeScript), Vite, CSS3
- **Backend:** NestJS (Node.js), TypeScript
- **Adatbázis:** PostgreSQL (Prisma ORM segítségével)

---

## Előfeltételek

A futtatáshoz szükséged lesz az alábbiakra:
- [Node.js](https://nodejs.org/) (v18+)
- [npm](https://www.npmjs.com/)
- Egy futó **PostgreSQL** adatbázis (vagy Docker)

---

## Telepítés és Futtatás

### 1. Backend beállítása
Navigálj a `backend` mappába:
```bash
cd backend
```

Telepítsd a függőségeket:
```bash
npm install
```

Hozd létre a `.env` fájlt és állítsd be az adatbázis elérhetőségét:
```env
PORT=3000

DATABASE_URL="mysql://root:@localhost:3306/futurenature"
JWT_SECRET="change-this-to-a-strong-secret"
```

Futtasd a Prisma migrációkat és a seed-et (adatbázis feltöltése):
```bash
npx prisma db push
npx prisma db seed
```

Indítsd el a backend szervert:
```bash
npm run start:dev
```

### 2. Frontend beállítása
Navigálj a `frontend` mappába:
```bash
cd ../frontend
```

Telepítsd a függőségeket:
```bash
npm install
```

Indítsd el a fejlesztői szervert:
```bash
npm run dev
```

---

## Használat

- A frontend alapértelmezetten a `http://localhost:5173` címen érhető el.
- A backend a `http://localhost:3000` porton fut.
- **API Dokumentáció (Swagger):** A backend API-ja és a tesztelési felület elérhető a: [http://localhost:3000/api](http://localhost:3000/api) címen.
- Regisztráció után kezdheted el a küldetések megoldását és a pontgyűjtést!

---

## Főbb funkciók

- **Játékos tanulás:** Kvízek és feladatok környezetvédelmi témákban.
- **Fejlődési rendszer:** Pontok, szintek és ranglista.
- **Admin felület:** Felhasználók és feladatok kezelése.
- **Reszponzív design:** Mobilról és asztali gépről is kényelmes használat.
