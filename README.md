# AutoSathi - Vehicle Maintenance Reminder Web App

A comprehensive vehicle maintenance reminder system designed for Indian users, helping track insurance, PUC expiry, service records, and fuel expenses.

## Features

-  JWT-based user authentication
-  Multiple vehicle management per user
-  Insurance expiry tracking with reminders
-  PUC expiry monitoring
-  Service record logging with odometer tracking
-  Fuel entry management with automatic mileage calculation
-  Dashboard with statistics and graphs
-  Document upload for certificates
-  Notification system for expiry reminders
-  Role-based authentication

## Tech Stack

- **Frontend**: React with Tailwind CSS
- **Backend**: Node.js Express
- **Database**: PostgreSQL
- **Containerization**: Docker
- **Authentication**: JWT
- **API**: REST APIs

## Quick Start

### Prerequisites
- Node.js 16+
- Docker and Docker Compose
- PostgreSQL (if not using Docker)

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm run setup
   ```

3. Set up environment variables (see `.env.example`)

4. Start with Docker:
   ```bash
   npm run docker:up
   ```

5. Or run locally:
   ```bash
   npm run dev
   ```

## Project Structure

```
AutoSathi/
├── frontend/          # React frontend
├── backend/           # Node.js backend
├── database/          # Database schemas and migrations
├── docs/             # Documentation
└── docker-compose.yml
```

## API Documentation

See `/docs/api.md` for detailed API documentation.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License.
