# TaskMaster - DB Setup (Instruction 3)

## Prereqs
- Node.js 16+
- MongoDB (local) OR MongoDB Atlas account

## Steps

1. Copy .env.example -> .env and set MONGO_URI
   - For local: MONGO_URI=mongodb://localhost:27017/taskmaster_dev
   - For Atlas: set your cluster URI

2. Install deps
   ```bash
   npm install
