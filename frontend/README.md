# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

### Pages Folder Structure

src/pages/
├── auth/ # Authentication flows
│ ├── LoginPage.jsx
│ ├── RegisterPage.jsx
│ └── ForgotPasswordPage.jsx
│
├── public/ # Publicly accessible pages
│ ├── HomePage.jsx
│ ├── AboutPage.jsx
│ ├── FAQPage.jsx
│ └── ContactPage.jsx
│
├── customer/ # Customer-specific pages
│ ├── dashboard/
│ │ ├── CustomerDashboard.jsx
│ │ └── components/ # Page-specific components
│ ├── repairs/
│ │ ├── RepairRequest.jsx
│ │ ├── ActiveRepairs.jsx
│ │ └── RepairDetail.jsx
│ └── products/
│ ├── ProductList.jsx
│ ├── ProductDetail.jsx
│ └── PurchaseHistory.jsx
│
├── worker/ # Worker-specific pages
│ ├── dashboard/
│ │ ├── WorkerDashboard.jsx
│ │ └── components/
│ ├── bids/
│ │ ├── BidManagement.jsx
│ │ └── BidDetail.jsx
│ └── portfolio/
│ ├── ServiceManagement.jsx
│ └── SalesListings.jsx
│
├── shared/ # Shared between roles
│ ├── ProfilePage.jsx
│ ├── SettingsPage.jsx
│ └── NotificationsPage.jsx
│
├── layout/ # Layout wrappers
│ ├── MainLayout.jsx # (Header/Nav/Footer)
│ ├── AuthLayout.jsx
│ └── DashboardLayout.jsx
│
└── error/ # Error handling
├── NotFoundPage.jsx
└── MaintenancePage.jsx
