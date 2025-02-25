# Done-It: On-Demand Service App

A web application that connects customers with service providers for various tasks and services.

## Prerequisites

Before running the application, make sure you have the following installed:
- Node.js (v14 or higher)
- PostgreSQL (v12 or higher)
- npm (Node Package Manager)

## Setup Instructions

### 1. Database Setup
1. Install PostgreSQL if you haven't already
2. Set up PostgreSQL password:
   ```sql
   # Open command prompt as administrator and run:
   psql -U postgres
   
   # If you get an error about password authentication, try:
   psql -U postgres -W
   # Enter the password you set during PostgreSQL installation
   
   # Once connected, set the password to match .env file:
   ALTER USER postgres WITH PASSWORD 'postgres';
   
   # Exit PostgreSQL
   \q
   ```
   Note: If you prefer to use a different password, make sure to update it in the `.env` file later.

3. Create a new database named `doneit`:
   ```sql
   CREATE DATABASE doneit;
   ```
4. Navigate to the backend directory and run the setup script:
   ```bash
   cd backend
   node setup-db.js
   ```

### 2. Backend Setup
1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the backend directory with the following content:
```
DB_USER=postgres
DB_PASSWORD=postgres    # Must match the password set in step 1.2
DB_HOST=localhost
DB_PORT=5432
DB_NAME=doneit
JWT_SECRET=your_secret_key
```

4. Start the backend server:
```bash
npm start
```
The backend server will start on http://localhost:5000

### 3. Frontend Setup
1. Open a new terminal and navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the frontend development server:
```bash
npm start
```
The frontend application will start on http://localhost:3000

## Using the Application

1. Open your browser and go to http://localhost:3000
2. Register a new account (you can choose to be either a customer or service provider)
3. Log in with your credentials
4. Start using the application:
   - As a customer: Browse services, make service requests
   - As a service provider: View and accept service requests

## Troubleshooting

1. Database Connection Issues:
   - Make sure PostgreSQL is running
   - Check your database credentials in the `.env` file
   - Verify that the database exists and tables are created
   - If you get "password authentication failed":
     1. Verify PostgreSQL is running (check Services on Windows)
     2. Try connecting with: `psql -U postgres -W`
     3. Make sure the password in `.env` matches your PostgreSQL password
     4. If needed, reset PostgreSQL password as shown in Database Setup step 1.2

2. Node Module Issues:
   - Try deleting the `node_modules` folder and `package-lock.json` file
   - Run `npm install` again

3. Port Conflicts:
   - If ports 3000 or 5000 are in use, you can modify them in:
     - Backend: `.env` file
     - Frontend: `package.json` file

## Support

For any issues or questions, please:
1. Check the troubleshooting section
2. Review the error messages in the console
3. Contact the development team

## License

This project is licensed under the MIT License.
