# API Reference

All endpoints are prefixed with `http://localhost:5050`. Protected routes require a JWT token passed as a Bearer token in the Authorization header.

---

## Auth — `/api/auth`

| Method | Endpoint | Role | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | None | Register a new student or teacher account |
| POST | `/api/auth/login` | None | Login and receive a JWT token |

---

## Pets — `/api/pets`

| Method | Endpoint | Role | Description |
|--------|----------|------|-------------|
| GET | `/api/pets/my-pet` | Student | Get the active pet |
| GET | `/api/pets/my-pets` | Student | Get all pets owned by the student |
| GET | `/api/pets/daily-status` | Student | Get whether free care actions have been used today |
| GET | `/api/pets/starter-options` | Student | Get available starter pets |
| POST | `/api/pets/choose-starter` | Student | Choose a starter pet |
| POST | `/api/pets/feed` | Student | Feed the active pet |
| POST | `/api/pets/play` | Student | Play with the active pet |
| POST | `/api/pets/brush` | Student | Brush the active pet |
| PATCH | `/api/pets/:petId/activate` | Student | Switch active pet |
| PATCH | `/api/pets/:id/rename` | Student | Rename a pet |

---

## Inventory — `/api/inventory`

| Method | Endpoint | Role | Description |
|--------|----------|------|-------------|
| GET | `/api/inventory/my-items` | Student | Get all items in the student's inventory |
| GET | `/api/inventory/equipment` | Student | Get currently equipped background and accessory |
| POST | `/api/inventory/use` | Student | Use a consumable item on the active pet |
| POST | `/api/inventory/equip` | Student | Equip a cosmetic item |
| POST | `/api/inventory/unequip` | Student | Unequip an item from a slot |

---

## Shop — `/api/shop`

| Method | Endpoint | Role | Description |
|--------|----------|------|-------------|
| GET | `/api/shop/items` | Student | Get all active shop items |
| POST | `/api/shop/buy` | Student | Purchase an item from the shop |

---

## Points — `/api/points`

| Method | Endpoint | Role | Description |
|--------|----------|------|-------------|
| GET | `/api/points/my-transactions` | Student | Get the student's point transaction history |
| GET | `/api/points/classroom/:classroomId` | Teacher | Get point transactions for a classroom |
| POST | `/api/points/award` | Teacher | Award points to a student |
| POST | `/api/points/award-bulk` | Teacher | Award points to multiple students or a full class |

---

## Classrooms — `/api/classrooms`

| Method | Endpoint | Role | Description |
|--------|----------|------|-------------|
| GET | `/api/classrooms/my-classrooms` | Teacher | Get all classrooms managed by the teacher |
| GET | `/api/classrooms/student-classrooms` | Student | Get all classrooms the student is enrolled in |
| GET | `/api/classrooms/:id` | Both | Get a specific classroom by ID |
| GET | `/api/classrooms/:id/students-overview` | Teacher | Get students and their point totals for a classroom |
| POST | `/api/classrooms` | Teacher | Create a new classroom |
| POST | `/api/classrooms/join` | Student | Join a classroom with a code |
| PUT | `/api/classrooms/:id` | Teacher | Update classroom details |
| PATCH | `/api/classrooms/:id/archive` | Teacher | Archive a classroom |
| DELETE | `/api/classrooms/:id/students/:studentId` | Teacher | Remove a student from a classroom |

---

## Battle — `/api/battle`

| Method | Endpoint | Role | Description |
|--------|----------|------|-------------|
| GET | `/api/battle/status` | Student | Get current monster, monster HP, and whether daily battle has been used |
| POST | `/api/battle/attack` | Student | Execute the daily battle, returns round-by-round results and rewards |
