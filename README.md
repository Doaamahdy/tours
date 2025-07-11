# 🌍 Travel Booking API (Node.js + MongoDB)

This is a **full-featured RESTful API** for a travel booking platform, built using **Node.js**, **Express**, **MongoDB**, and **Mongoose**.

It supports user authentication, role-based access, tour management, reviews, image upload and processing, email handling, geo queries, and more — with a clean MVC structure.

---

## 🚀 Features

### ✅ Authentication & Authorization
- Signup, login, logout with **JWT** + cookies.
- Role-based access control (`admin`, `guide`, `user`, etc).
- Password reset via email.
- Secure password hashing (bcrypt).
- Update and deactivate own account.

### 🗺️ Tours
- CRUD operations with optional image upload.
- Resize and optimize images using **Sharp**.
- Get tour stats and plans using aggregation.
- Geo-spatial queries (find tours within distance).
- Calculate distances from a point.

### ⭐ Reviews
- Nested route: `POST /tours/:tourId/reviews`.
- One review per user per tour (compound index).
- Automatically calculates average rating for tours.

### 👤 Users
- Profile photo upload and resize.
- View and update personal info (`/me`).
- Password change and protection middleware.

### 📦 Image Uploads
- Uses **Multer** for uploading.
- Stores in memory, then processes with **Sharp**.
- Separate logic for `users` and `tours`.

### 🧠 Clean Architecture
- Async error handling with middleware.
- Factory functions for generic CRUD.
- Reusable utility classes: `AppError`, `APIFeatures`, `Email`.

---

## 📁 Project Structure

```
.
├── controllers/
├── models/
├── routes/
├── middleware/
├── utilities/
├── public/
├── views/
├── server.js
└── config.env
```

---

## 🔐 Authentication Flow

1. **Signup/Login** returns a `JWT` token stored as a secure cookie.
2. **protect** middleware restricts private routes.
3. **restrictTo('admin')** middleware limits access based on role.
4. Passwords are hashed using `bcryptjs`, and never returned in queries (`select: false`).
5. Reset tokens are created via `crypto`, hashed, and stored with an expiration time.

---

## 📸 Image Upload

### 🧑 User Photo:
- `uploadUserPhoto` → stores in memory
- `resizeUserPhoto` → resizes to 500x500 and saves

### 🏞️ Tour Photos:
- Upload `imageCover` and up to 3 `images`
- Resize to 2000x1333 and compress

---

## 📮 API Routes

### 🧑 User

- `POST /api/v1/users/signup`
- `POST /api/v1/users/login`
- `POST /api/v1/users/forgotPassword`
- `PATCH /api/v1/users/resetPassword/:token`
- `PATCH /api/v1/users/updateMyPassword`
- `GET /api/v1/users/me`
- `PATCH /api/v1/users/updateMe`
- `DELETE /api/v1/users/deleteMe`

### 🗺️ Tour

- `GET /api/v1/tours`
- `GET /api/v1/tours/:id`
- `POST /api/v1/tours`
- `PATCH /api/v1/tours/:id`
- `DELETE /api/v1/tours/:id`
- `GET /api/v1/tours-within/:distance/center/:latlng/unit/:unit`
- `GET /api/v1/tours/distances/:latlng/unit/:unit`

### ⭐ Review

- `POST /api/v1/tours/:tourId/reviews`
- `GET /api/v1/reviews`
- `PATCH /api/v1/reviews/:id`
- `DELETE /api/v1/reviews/:id`

---

## 🧪 Tech Stack

- **Node.js**
- **Express**
- **MongoDB + Mongoose**
- **JWT** for Auth
- **Multer + Sharp** for Image Upload
- **Pug** for Templating
- **SendGrid / Nodemailer** for Emails
- **Crypto** for secure reset tokens

---

## 🛠️ Setup

1. Clone the repository:

```bash
git clone https://github.com/your-username/travel-booking-api.git
cd travel-booking-api
```

2. Install dependencies:

```bash
npm install
```

3. Create `.env` file:

```env
PORT=3000
NODE_ENV=development
DATABASE=mongodb+srv://<username>:<password>@cluster.mongodb.net/natours
DATABASE_PASSWORD=your-db-password
JWT_SECRET=your-secret
JWT_EXPIRES_IN=90d
JWT_COOKIE_EXPIRES_IN=90
EMAIL_HOST=smtp.example.com
EMAIL_PORT=587
EMAIL_USERNAME=your-email@example.com
EMAIL_PASSWORD=your-password
```

4. Run the server:

## 🛠  Development Mode
```bash
npm run start:dev
```

## 🏭 Production Mode
```bash
npm run start:prod
```

---

## 🧑 Author

**Doaa Mahdy**  
🔗 [GitHub](https://github.com/Doaamahdy)