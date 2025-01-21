# 🚀 **FixItHub** Project

Welcome to **FixItHub**, a platform where you can **buy, sell, repair**, and **request services** for used products! 🛠️💡

This project allows users to browse products, request repairs, and interact with service providers. Service providers can bid on repair requests, sell spare parts, and more!

## 🌟 **Project Architecture**

### **Monorepo Structure**:

The project is organized in a **monorepo** containing both the **front-end** and **back-end**:

```
/fixithub
  /backend               # Backend (Node.js + MongoDB)
  /frontend              # Frontend (React + Vite + ShadCN)
  package.json           # Root package.json
  .gitignore             # Git ignore file
  README.md              # Project documentation
```

### **Backend** (Node.js + MongoDB):

- **Express** for API server.
- **MongoDB** for storing data (users, products, repair requests, etc.).
- **Mongoose** for easy MongoDB interaction.

### **Frontend** (React + Vite + ShadCN):

- **React** for the user interface.
- **Vite** for fast build and development.
- **ShadCN** for UI components and styles.
- **React Query** for data fetching and state management.

## 🛠️ **How to Set Up the Project**

### Prerequisites:

- **Node.js** (v16 or later)
- **npm** (v8 or later)

### 1. **Clone the Repository**:

```bash
git clone https://github.com/your-username/FixItHub.git
cd FixItHub
```

### 2. **Install Dependencies**:

Run the following command to install dependencies for both front-end and back-end:

```bash
npm install
```

This will install dependencies in both `/frontend` and `/backend` directories.

### 3. **Set Up Environment Variables**:

Create a `.env` file in the `backend` folder and add your MongoDB URI and other configuration values:

```
MONGO_URI=your-mongodb-connection-string
PORT=5000
```

### 4. **Run the Project**:

#### For **Development**:

Start both front-end and back-end using the following command:

```bash
npm start
```

This will run the front-end on `http://localhost:3000/` and the back-end on `http://localhost:5000/`.

#### For **Backend Only**:

If you want to run the back-end separately:

```bash
npm run start:backend
```

#### For **Frontend Only**:

If you want to run the front-end separately:

```bash
npm run start:frontend
```

## 📝 **Features**:

- **For Users**: Register, browse products, create repair requests, track progress, chat with service providers, rate services, and more!
- **For Service Providers**: Register, display services, sell spare parts, bid for repairs, and manage requests.

## 🚧 **To-Do**:

- Implement product browsing and repair request APIs.
- Integrate React Query for data fetching.
- Build UI with ShadCN components.

## 📂 **Contributing**:

1. Fork the repo.
2. Create a feature branch: `git checkout -b feature/your-feature`.
3. Commit your changes: `git commit -m 'Add feature'`.
4. Push to the branch: `git push origin feature/your-feature`.
5. Open a pull request!

## 👥 **Team Members**:

- **Anas Hany** - Full Stack Developer (MERN)
- **Islam Sobhi** - Mobile Developer (Flutter)
- **Ahmed Matter** - Front-End Developer
- **Afnan Raafat** - Documentation
- **Mariam Zaki** - UI/UX Designer

## 🎉 **Happy Coding!** 🚀
