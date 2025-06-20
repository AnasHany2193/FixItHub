# FixItHub

[![GitHub Stars](https://img.shields.io/github/stars/AnasHany2193/FixItHub.svg)](https://github.com/AnasHany2193/FixItHub/stargazers)
[![GitHub Forks](https://img.shields.io/github/forks/AnasHany2193/FixItHub.svg)](https://github.com/AnasHany2193/FixItHub/network)
[![GitHub Issues](https://img.shields.io/github/issues/AnasHany2193/FixItHub.svg)](https://github.com/AnasHany2193/FixItHub/issues)

## 🌟 Overview

Welcome to **FixItHub**, a dynamic full-stack web platform that connects customers with skilled workers for repair services and powers a vibrant marketplace for products! Hosted at [FixItHub GitHub](https://github.com/AnasHany2193/FixItHub), FixItHub offers a seamless experience for managing repair requests, selling products, and overseeing platform operations. With role-based access for customers, workers, and admins, it ensures tailored functionality for each user. Featuring a sleek, portfolio-style interface with smooth animations, FixItHub is built for usability and scalability. Whether you're fixing a broken appliance or shopping for tools, FixItHub has you covered! 🚀

## 🚀 Features

### 👥 User Management

- **Authentication & Authorization**: Secure registration and login using JWT-based authentication 🔒.
- **Role-Based Access**: Supports three roles—customers, workers, and admins—with specific permissions for each.
- **Profile Management**: Users can update personal details, including avatars, addresses, social media links, and worker-specific information like skills and certifications ✏️.
- **Public Profiles**: Customers can view worker profiles (skills, ratings), and workers can view customer profiles (ratings, bio), with role-based restrictions 👀.

### 🛠️ Repair Services

- **Repair Requests**: Customers submit detailed requests with descriptions and images, trackable at `/repairs/history` 📋.
- **Worker Applications**: Workers apply with skills, certifications, and work history, pending admin approval at `/admin/users` ✅.
- **Assignment Options**: Supports auction-style bidding (`/repairs/auctions`) and direct offers (`/repairs/direct-offers`) for flexible repair assignments 💰.
- **Repair Tracking**: Real-time status updates (e.g., "Awaiting Assignment", "Completed") ⏳.
- **Reviews**: Customers rate and review workers post-service, enhancing trust ⭐.

### 🛒 Marketplace

- **Product Listings**: Workers list items with images, descriptions, and prices at `/marketplace/new-product` 🏷️.
- **Shopping**: Customers browse, filter, and purchase products at `/marketplace/products` 🛍️.
- **Cart & Favorites**: Add items to cart or favorites for easy access ❤️.
- **Order Management**: Track order statuses (e.g., "Pending", "Shipped") at `/marketplace/orders` 📦.
- **Reviews**: Rate and review purchased products to share feedback 🌟.

### 🖥️ Admin Panel

- **Dashboard**: Displays system-wide stats (users, repairs, products, orders, reviews) and recent activities at `/admin-dashboard` 📊.
- **User Management**: Admins can ban, activate, or approve worker applications at `/admin/users` 👮.
- **Content Oversight**: Manage repairs (`/admin/repairs`), products (`/admin/products`), orders (`/admin/orders`), and reviews (`/admin/reviews`) with delete capabilities 🗑️.
- **Logs**: Track admin actions (e.g., user bans, content deletions) at `/admin/logs` for transparency 📜.

### 🎨 Additional Features

- **Responsive Design**: Optimized for mobile and desktop with Tailwind CSS 📱💻.
- **Animations**: Smooth transitions and hover effects using Framer Motion ✨.
- **File Uploads**: Supports image uploads for avatars, repair photos, and product images 🖼️.
- **Notifications**: Toast alerts for success and error messages 🔔.

## 📸 Screenshots

Explore FixItHub's user interface through these screenshots, available in the [screenshots/](https://github.com/AnasHany2193/FixItHub/tree/main/screenshots) directory:

- [Customer Dashboard](https://github.com/AnasHany2193/FixItHub/blob/main/screenshots/customer-dashboard.png): View repair and order summaries 🖥️.
- [Worker Dashboard](https://github.com/AnasHany2193/FixItHub/blob/main/screenshots/Customer/dashboard-light.png): Monitor active repairs and product sales 📈.
- [Admin Dashboard](https://github.com/AnasHany2193/FixItHub/blob/main/screenshots/Admin/dashboard-light.png): System stats and management tools 📊.
- [Repair Request Form](https://github.com/AnasHany2193/FixItHub/blob/main/screenshots/Customer/Repairs/1-repairs-new-light.png): Submit repair details with ease 🔧.
- [Product Listing](https://github.com/AnasHany2193/FixItHub/blob/main/screenshots/Customer/Products/1-products-light.png): Browse marketplace products 🛒.

## 🛠️ Technologies Used

| **Component** | **Technology**     | **Purpose**                              |
| ------------- | ------------------ | ---------------------------------------- |
| **Backend**   | Node.js            | Server-side JavaScript runtime ⚙️        |
|               | Express.js         | RESTful API framework 🌐                 |
|               | MongoDB (Mongoose) | NoSQL database with schema management 🗄️ |
|               | JWT                | Secure authentication tokens 🔑          |
|               | Bcrypt             | Password hashing 🔐                      |
|               | Validator          | Input validation (emails, URLs) ✅       |
|               | Local Storage      | Image uploads 📸                         |
| **Frontend**  | React              | Dynamic user interfaces ⚛️               |
|               | React Router       | Client-side navigation 🧭                |
|               | Tailwind CSS       | Utility-first styling 🎨                 |
|               | shadcn/ui          | Reusable UI components 🧩                |
|               | Framer Motion      | Smooth animations 🌈                     |
|               | React Query        | Data fetching and caching ⚡             |
|               | Axios              | API requests 📡                          |
|               | Lucide React       | Icon library 🎯                          |
| **Dev Tools** | Git                | Version control 🗂️                       |
|               | ESLint, Prettier   | Code linting and formatting 🧹           |

## 📦 Installation

To run FixItHub locally:

1. **Clone the Repository**:

   ```bash
   git clone https://github.com/AnasHany2193/FixItHub.git
   cd FixItHub
   ```

2. **Install Dependencies**:

   ```bash
   npm install
   ```

3. **Set Up Environment Variables**:

   - Create a `.env` file in the root:
     ```env
     MONGO_URI=mongodb://localhost:27017/fixithub
     JWT_SECRET=your_jwt_secret_key
     BASE_URL=http://localhost:5000
     ```
   - Ensure MongoDB is running locally or use [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).

4. **Start the Application**:

   - Development mode:
     ```bash
     npm run dev
     ```
   - Production mode:
     ```bash
     npm start
     ```

5. **Access the Application**:
   - Open [http://localhost:5000](http://localhost:5000) in your browser 🌐.

## 🎯 Usage

### Customers

- **Sign Up/Login**: Register at `/register` or log in at `/login`.
- **Request Repairs**: Submit details at `/repairs/new` 🔧.
- **Browse Workers**: View profiles at `/users/:id` to check skills and ratings.
- **Shop Marketplace**: Explore products at `/marketplace/products`, add to cart, and purchase 🛒.
- **Track Activity**: Monitor repairs at `/repairs/history` and orders at `/marketplace/orders`.
- **Leave Reviews**: Rate workers and products post-service or purchase ⭐.

### Workers

- **Apply as Worker**: Submit skills and certifications at `/profile` 🛠️.
- **Manage Repairs**: Accept jobs at `/repairs/auctions` or `/repairs/direct-offers`.
- **Sell Products**: List items at `/marketplace/new-product`.
- **View Customers**: Check profiles at `/users/:id`.

### Admins

- **Dashboard**: View stats and activities at `/admin-dashboard` 📈.
- **Manage Users**: Ban, activate, or approve workers at `/admin/users` 👥.
- **Oversee Content**: Handle repairs (`/admin/repairs`), products (`/admin/products`), orders (`/admin/orders`), and reviews (`/admin/reviews`).
- **View Logs**: Monitor admin actions at `/admin/logs` 📝.

## 📁 Project Structure

```
FixItHub/
├── backend/
│   ├── controllers/         # API logic (e.g., userController.js)
│   ├── models/             # Mongoose schemas (e.g., User.js)
│   ├── routes/             # Express routes (e.g., userRoutes.js)
│   ├── middleware/         # Authentication and role-based middleware
│   └── utils/              # Utilities (e.g., localImageUpload.js)
├── frontend/
│   ├── src/
│   │   ├── api/            # API clients (e.g., user.js)
│   │   ├── components/     # Reusable UI components (e.g., HeaderPages.jsx)
│   │   ├── hooks/          # React Query hooks (e.g., useUser.js)
│   │   ├── pages/          # Page components (e.g., UserProfilePage.jsx)
│   │   ├── layouts/        # Layout components (e.g., DashboardLayout.jsx)
│   │   └── context/        # Context providers (e.g., AuthContext.js)
├── screenshots/            # UI screenshots (e.g., customer-dashboard.png)
├── .env                    # Environment variables
├── package.json            # Dependencies and scripts
└── README.md               # Project documentation
```

## 🤝 Contributing

We welcome contributions to FixItHub! To get started:

1. **Fork the Repository**:

   ```bash
   git clone https://github.com/AnasHany2193/FixItHub.git
   ```

2. **Create a Branch**:

   ```bash
   git checkout -b feature/your-cool-idea
   ```

3. **Make Changes**:

   - Write clean, documented code.
   - Follow ESLint and Prettier standards.
   - Add tests for new features or fixes.

4. **Commit Changes**:

   - Use conventional commits (e.g., `feat: add new feature`, `fix: resolve bug`).

   ```bash
   git commit -m "feat: add my cool idea 🌟"
   ```

5. **Submit a Pull Request**:
   - Push your branch and create a pull request at [GitHub Pull Requests](https://github.com/AnasHany2193/FixItHub/pulls).
   - Provide a clear description of your changes.

## 👥 Team Members

| Role              | Team Member                                          | Focus Area              |
| ----------------- | ---------------------------------------------------- | ----------------------- |
| 🎨 UI/UX Designer | [Mariam Zaki](https://github.com/maryem-zaky)        | User Experience Design  |
| 💻 Frontend Dev   | [Afnan Raafat](https://github.com/afnan-raafat)      | React Implementation    |
| 📱 Mobile Dev     | [Islam Sobhi](https://github.com/Islam-Sobhy-Yousof) | Flutter Applications    |
| 🌐 Full Stack Dev | [Anas Hany](https://github.com/AnasHany2193)         | MERN Stack Architecture |

---

**Made with ♥ by Team FixItHub**  
_Empowering repairs, connecting communities_
