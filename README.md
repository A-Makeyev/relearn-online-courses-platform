# Easy Programming

A full-stack course marketplace for practical programming education. Students browse a searchable catalog, preview lectures, enroll through PayPal, track lecture-by-lecture progress, and review courses. Instructors manage their catalog, upload media, and monitor performance from a dedicated studio.

Built with the MERN stack: MongoDB, Express, React (Vite), and Node.js, with Tailwind CSS and Radix UI.

## Highlights

### Student experience

- Marketplace landing page with search, categories, featured courses, and live catalog stats
- URL-driven catalog with keyword search, category / level / language filters, and sorting
- Course landing pages with learning objectives, expandable curriculum, free previews, instructor details, ratings, and related courses
- Enrollment-aware enrollment box: preview or continue a course you already own
- Secure PayPal checkout with server-side price calculation and payment verification
- **My learning** dashboard with enrolled, in-progress, and completed views
- Distraction-free course player with automatic progress saving, manual completion, next/previous navigation, and a searchable lecture sidebar
- Star ratings and written reviews for enrolled students
- Wishlist: save any course with the heart button and return to it from a dedicated saved-courses page
- Verifiable certificates: finishing every lecture issues a permanent certificate with a public verification page and a print / save-as-PDF layout
- Responsive layouts, empty states, loading skeletons, and toast feedback throughout

### Instructor experience

- Instructor studio with a branded sidebar and mobile drawer
- Performance dashboard: students, revenue, published lectures, average rating, revenue by course, and recent enrollments
- Course manager with thumbnails, pricing, revenue, ratings, publish status, and guarded deletion
- Course builder with image upload, bulk lecture upload, video previews, and draft/publish settings
- Learning mode: the same instructor account can browse the catalog, enroll in courses, save a wishlist, and earn certificates
- One-click learner preview of any course directly from the course manager

### Security and reliability

- JWT authentication with role-based authorization on every private route
- Instructor-only access to course management and media upload endpoints
- Server-authoritative checkout: the client sends only a course ID; price and learner identity come from the database and token
- PayPal payment execution and idempotent order confirmation
- Ownership checks on enrollment, progress, and acquired-course endpoints
- Input validation for registration, reviews, and course payloads
- Field whitelisting so clients cannot overwrite ownership, ratings, or student lists
- Randomly generated certificate codes and a public verification endpoint that never exposes user IDs or emails
- Consistent JSON errors, API health check, and safe course deletion (no replica-set requirement)

## Tech stack

| Layer | Tools |
| --- | --- |
| Client | React 18, Vite, React Router, Tailwind CSS, Radix UI, Lucide, Sonner, React Player |
| Server | Node.js, Express, Mongoose, JWT, bcryptjs, Multer |
| Services | MongoDB, Cloudinary, PayPal |

## Getting started

### 1. Install dependencies

```bash
npm install
npm install --prefix client
```

### 2. Configure environment variables

Copy `.env.example` to `.env` and fill in the values. At minimum you need a working `MONGODB_URI`; `JWT_SECRET` should be set to a long random value outside local development.

Copy `client/.env.example` to `client/.env` only if your API is not running on `http://localhost:5000` and is not served from the same origin.

### 3. Seed demo data (optional)

```bash
npm run import-data
```

This imports demo courses and users. To remove all data:

```bash
npm run destroy-data
```

### 4. Run the app

```bash
npm run dev
```

- Client: http://localhost:5173
- API: http://localhost:5000
- Health check: http://localhost:5000/api/health

### Demo accounts (after seeding)

| Role | Email | Password |
| --- | --- | --- |
| Instructor | `admin@email.com` | `admin` |
| Student | `oriello.jilo@jilo.oriello` | `1` |

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Run API and client concurrently |
| `npm run server` | Run the API with nodemon |
| `npm run client` | Run the Vite dev server |
| `npm run build` | Install dependencies and build the client |
| `npm run import-data` | Seed demo data |
| `npm run destroy-data` | Delete all seeded data |

## Project structure

```text
client/
  src/
    components/       shared UI, course card, rating stars, header, footer
    context/          auth, instructor, student, and wishlist state
    pages/            auth, student pages, instructor studio
    services/         typed API helpers
server/
  controllers/        auth, student, instructor, review, order logic
  middleware/         JWT authentication and role authorization
  models/             User, Course, Review, Order, Progress, StudentCourses, Certificate, Wishlist
  routes/             REST endpoints
  helpers/            Cloudinary, PayPal, JWT config, certificate issuer, seeder
```

## API overview

| Method | Route | Access |
| --- | --- | --- |
| `POST` | `/auth/register` | Public |
| `POST` | `/auth/login` | Public |
| `GET` | `/auth/verify` | Authenticated |
| `GET` | `/student/courses/all-courses` | Authenticated app |
| `GET` | `/student/courses/course-details/:id` | Authenticated app |
| `GET` | `/student/courses/purchase-info/:id/:studentId` | Owner |
| `GET` | `/student/courses/:courseId/reviews` | Authenticated app |
| `POST` | `/student/courses/:courseId/reviews` | Enrolled student |
| `POST` | `/student/order/create-order` | Authenticated student |
| `POST` | `/student/order/capture-payment` | Order owner |
| `GET` | `/student/acquired-courses/:studentId` | Owner |
| `GET` | `/student/course-progress/:userId/:courseId` | Owner |
| `POST` | `/student/course-progress/view-lecture` | Enrolled student |
| `GET` | `/student/wishlist` | Authenticated |
| `GET` | `/student/wishlist/ids` | Authenticated |
| `POST` | `/student/wishlist/:courseId` | Authenticated |
| `DELETE` | `/student/wishlist/:courseId` | Authenticated |
| `POST` | `/certificates/:courseId` | Enrolled + course completed |
| `GET` | `/certificates/mine` | Authenticated |
| `GET` | `/certificates/verify/:code` | Public |
| `POST` | `/instructor/courses/new-course` | Instructor |
| `GET` | `/instructor/courses/all-courses` | Instructor |
| `PUT` | `/instructor/courses/update-course/:id` | Instructor |
| `DELETE` | `/instructor/courses/delete/:id` | Instructor |
| `POST` | `/media/upload` | Instructor |

## Notes

- PayPal runs in sandbox mode by default. Set `PAYPAL_MODE=live` with live credentials for production.
- Course media is stored in Cloudinary; configure the three Cloudinary variables before uploading.
- Ratings are calculated from enrolled-student reviews; new courses display as “New” until their first review.
- The instructor catalog is visible to every instructor account, which suits the current single-instructor demo. Multi-tenant ownership checks should be added before running a public marketplace with many instructors.
- Existing databases created before the rating feature will show `averageRating: 0` until students submit reviews.
- Certificates are snapshots of the course title, instructor, and issue date. They remain valid if the learner later resets their progress.
- An instructor account is also a learner account. Use “Learning mode” in the studio sidebar (or “Instructor studio” in the learner header) to move between the two experiences. There is no separate account to create; emails stay unique across the platform.
- The certificate verification page is public by design so employers can confirm a certificate without signing in.
