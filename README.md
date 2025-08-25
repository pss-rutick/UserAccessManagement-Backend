# Fertiwell User Management System

A complete user management dashboard with live Firebase integration and admin controls.

## 🚀 Features

- **Live Firebase Integration**: Real-time data synchronization with Firestore
- **Admin Dashboard**: Beautiful dashboard with live statistics and metrics
- **User Management**: Full CRUD operations for user management
- **Real-time Updates**: Live data refresh every 10 seconds
- **Status Control**: Activate/deactivate users instantly
- **Docker Support**: Complete containerization for development and production

## 🏗️ Architecture

```
├── Backend (Node.js + TypeScript + Express)
│   ├── Firebase Admin SDK integration
│   ├── RESTful API endpoints
│   └── Real-time data processing
│
├── Frontend (React + TypeScript + Vite)
│   ├── Modern UI with Tailwind CSS
│   ├── Real-time dashboard
│   └── Admin controls interface
│
└── Firebase Firestore
    ├── User data storage
    ├── Real-time synchronization
    └── Admin operations logging
```

## 🛠️ Development Setup

### Prerequisites

- Docker & Docker Compose
- Node.js 18+ (for local development)
- Firebase project with Firestore enabled

### Firebase Setup

1. Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
2. Enable Firestore Database in test mode
3. Generate service account key:
   - Go to Project Settings > Service Accounts
   - Click "Generate new private key"
   - Save as `serviceAccountKey.json` in the backend root directory

### Docker Development Environment

**Start the complete application:**

```bash
# Clone the repository
git clone <repository-url>
cd fertiwell-backend

# Start development environment with hot reload
docker-compose -f docker-compose.dev.yml up --build

# Or use the shortcut script
./scripts/dev-start.sh
```

**Access the application:**
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000
- Health Check: http://localhost:5000/health

**Stop the application:**
```bash
docker-compose -f docker-compose.dev.yml down
```

### Local Development (without Docker)

**Backend:**
```bash
cd fertiwell-backend
npm install
npm run dev
```

**Frontend:**
```bash
cd UserAccessManager
npm install
npm run frontend
```

## 🚀 Production Deployment

### Docker Production Environment

```bash
# Build and start production containers
docker-compose -f docker-compose.prod.yml up --build -d

# View logs
docker-compose -f docker-compose.prod.yml logs -f

# Stop production containers
docker-compose -f docker-compose.prod.yml down
```

**Production URLs:**
- Frontend: http://localhost (port 80)
- Backend API: http://localhost:5000

## 📡 API Endpoints

### Dashboard APIs
- `GET /api/dashboard/stats` - Live dashboard statistics
- `GET /api/dashboard/recent-users` - Recent user activity
- `GET /api/dashboard/activity` - Activity feed

### User Management APIs
- `GET /api/mobile-users` - Get all users (with search)
- `GET /api/mobile-users/:id` - Get specific user
- `POST /api/mobile-users` - Create new user
- `PUT /api/mobile-users/:id` - Update user details
- `PATCH /api/mobile-users/:id/status` - Toggle user status
- `DELETE /api/mobile-users/:id` - Delete user

### Health Check
- `GET /health` - Application health status

## 🎮 Admin Operations

### User Management
- **View Users**: Real-time user list with search and filtering
- **Edit User**: Update user details (name, email, access level, stage)
- **Activate/Deactivate**: Toggle user status instantly
- **Delete User**: Permanently remove user with confirmation

### Dashboard Features
- **Live Statistics**: Total users, active users, daily sessions, average scores
- **User Segmentation**: Users by access level (Standard, Premium, Admin)
- **Activity Feed**: Real-time activity updates
- **Push Notifications**: Send notifications to user groups

## 🔧 Configuration

### Environment Variables

**Backend (.env):**
```env
NODE_ENV=development
PORT=5000
```

**Frontend (.env):**
```env
VITE_API_URL=http://localhost:5000
NODE_ENV=development
```

### Firebase Configuration

Place your `serviceAccountKey.json` in the backend root directory:

```json
{
  "type": "service_account",
  "project_id": "your-project-id",
  "private_key_id": "...",
  "private_key": "...",
  "client_email": "...",
  "client_id": "...",
  "auth_uri": "...",
  "token_uri": "...",
  "auth_provider_x509_cert_url": "..."
}
```

## 🐳 Docker Commands

### Development
```bash
# Start development environment
docker-compose -f docker-compose.dev.yml up --build

# View logs
docker-compose -f docker-compose.dev.yml logs -f

# Restart a service
docker-compose -f docker-compose.dev.yml restart backend-dev

# Stop and remove containers
docker-compose -f docker-compose.dev.yml down -v
```

### Production
```bash
# Start production environment
docker-compose -f docker-compose.prod.yml up -d --build

# Scale services
docker-compose -f docker-compose.prod.yml up -d --scale backend=2

# Update a service
docker-compose -f docker-compose.prod.yml up -d --no-deps backend

# Stop production environment
docker-compose -f docker-compose.prod.yml down
```

### Utility Commands
```bash
# Clean up Docker system
docker system prune -a

# View container logs
docker logs fertiwell-backend-dev -f

# Access container shell
docker exec -it fertiwell-backend-dev sh

# Monitor resource usage
docker stats
```

## 🔍 Troubleshooting

### Common Issues

**Firebase Connection Error:**
- Ensure Firestore database is created in Firebase Console
- Verify `serviceAccountKey.json` is properly configured
- Check Firebase project ID matches the service account

**Docker Build Failures:**
- Clear Docker cache: `docker system prune -a`
- Rebuild without cache: `docker-compose build --no-cache`
- Check Docker daemon is running

**Port Conflicts:**
- Backend (5000): `lsof -ti:5000 | xargs kill -9`
- Frontend (5173): `lsof -ti:5173 | xargs kill -9`

**Hot Reload Not Working:**
- Ensure volumes are properly mounted
- Set `CHOKIDAR_USEPOLLING=true` for file watching
- Restart Docker containers

## 📊 Performance

### Optimization Features
- **Real-time Updates**: 10-second refresh intervals for live data
- **Efficient Queries**: Optimized Firebase queries with pagination
- **Caching**: Smart query caching with React Query
- **Compression**: Gzip compression in production
- **CDN Ready**: Optimized static asset serving

### Monitoring
- Health checks for all services
- Docker container resource monitoring
- Firebase query performance tracking
- Real-time error logging

## 🔐 Security

- **Authentication**: Firebase Admin SDK for secure operations
- **Authorization**: Role-based access control
- **Data Validation**: Input sanitization and validation
- **CORS**: Configured cross-origin resource sharing
- **Headers**: Security headers in production

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test with Docker environment
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

---

**🔥 Built with Firebase, React, Node.js, and Docker**
