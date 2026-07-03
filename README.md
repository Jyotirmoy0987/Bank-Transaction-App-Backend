# Bank Transaction Backend API

A secure RESTful banking backend built with **Node.js**, **Express.js**, and **MongoDB** that simulates core banking operations such as account creation, money transfers, ledger management, and transaction history.

The application follows the **double-entry accounting principle** to ensure every transfer remains balanced and consistent. MongoDB transactions are used to guarantee atomicity, while idempotency prevents duplicate transfers caused by retries.

---

## Features

* User authentication using JWT
* Secure password hashing with bcrypt
* Account creation for users
* Initial account funding
* Money transfer between accounts
* Double-entry ledger system
* Transaction history
* Balance calculation from ledger entries
* MongoDB ACID transactions using sessions
* Idempotency support for safe retries
* Input validation and error handling
* Cookie and Bearer token authentication support

---

## Tech Stack

* Node.js
* Express.js
* MongoDB
* Mongoose


---

## Installation

Clone the repository.

```bash
git clone https://github.com/Jyotirmoy0987/Bank-Transaction-App-Backend
```

Move into the project directory.

```bash
cd bank-backend
```

Install dependencies.

```bash
npm install
```

Create a `.env` file.

```env
PORT=5000

MONGO_URI=your_mongodb_connection_string

JWT_SECRET=your_secret_key
```

Run the development server.

```bash
npm run dev
```

or

```bash
node server.js
```

---

## Authentication

After login, a JWT token is generated.

The API supports authentication through:

* HTTP-only cookies
* Authorization header

```
Authorization: Bearer <token>
```

---

## API Endpoints

### Authentication

| Method | Endpoint             | Description         |
| ------ | -------------------- | ------------------- |
| POST   | `/api/auth/register` | Register a new user |
| POST   | `/api/auth/login`    | Login user          |
| POST   | `/api/auth/logout`   | Logout user         |

---

### Accounts

| Method | Endpoint                | Description                |
| ------ | ----------------------- | -------------------------- |
| GET    | `/api/accounts`         | Get user accounts          |
| GET    | `/api/accounts/balance` | Get account balance        |
| POST   | `/api/accounts`         | Create new account         |

---

### Transactions

| Method | Endpoint                                 | Description                    |
| ------ | ---------------------------------------- | ------------------------------ |
| POST   | `/api/transactions/system/initial-funds` | Add initial balance to account |
| POST   | `/api/transactions/`                     | Create Transaction             |


---

## Double Entry Ledger

Every transfer creates **two ledger entries**.

Example:

Transfer ₹500 from Account A to Account B.

| Account   | Type   | Amount |
| --------- | ------ | ------ |
| Account A | DEBIT  | 500    |
| Account B | CREDIT | 500    |

The account balance is calculated as:

```
Balance = Total Credits - Total Debits
```

No balance is stored directly in the Account document, ensuring data consistency.

---

## MongoDB Transactions

Money transfers use MongoDB sessions to ensure atomic operations.

If any step fails:

* transaction creation
* ledger creation
* idempotency record creation

the entire operation is rolled back automatically.

---

## Idempotency

Each transfer request requires an `idempotencyKey`.

If the same request is retried due to:

* network timeout
* client retry
* duplicate submission

the server returns the previously processed transaction instead of creating a duplicate transfer.


---

## Security

* Password hashing using bcrypt
* JWT authentication
* Protected routes
* MongoDB transactions
* Input validation
* Idempotency support
* HTTP-only cookies

---

