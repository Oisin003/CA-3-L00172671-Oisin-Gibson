# Bookstore Application

**Author:** Oisin Gibson - L00172671  
**Course:** Web Component Development - CA 3

A full-stack bookstore application built with React and Node.js/Express, featuring a shopping cart, user authentication, and admin book management.

---

##  Table of Contents

- [Features](#features)
- [Technologies Used](#technologies-used)
- [Getting Started](#getting-started)
- [How to Use](#how-to-use)
- [Project Structure](#project-structure)
- [API Endpoints](#api-endpoints)
- [References](#references)

---

##  Features

### Customer Features
- **Browse Books**: View all available books with search functionality
- **Book Details**: See detailed information about each book
- **Shopping Cart**: Add books to cart and manage quantities
- **Checkout**: Complete purchases with delivery and payment information
- **User Accounts**: Login to track purchases and receive discounts
- **Loyalty Discounts**: 
  - 5% off when total spent > €50
  - 10% off when total spent > €100
- **Dark Mode**: Toggle between light and dark themes
- **Currency Converter**: Switch between EUR (€), USD ($), GBP (£), and JPY (¥)

### Admin Features
- **Book Import**: Import books from JSON file
- **Inventory Management**: View and manage book stock

---

##  Technologies Used

### Frontend
- **React 19.2.0** - UI framework
- **React Router DOM 6.14.1** - Client-side routing
- **Tailwind CSS 4.1.17** - Utility-first CSS framework
- **Context API** - State management for dark mode and currency conversion

### Backend
- **Node.js & Express 5.1.0** - Server framework
- **MongoDB & Mongoose 9.0.0** - Database and ODM
- **CORS** - Cross-origin resource sharing
- **dotenv** - Environment variable management

---

##  Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (running locally or remote connection)
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   cd bookstore
   ```

2. **Install Backend Dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Install Frontend Dependencies**
   ```bash
   cd ../frontend
   npm install
   ```

4. **Setup Environment Variables** (Optional)
   
   Create a `.env` file in the `backend` folder:
   ```
   MONGO_URI=mongodb://127.0.0.1:27017/bookstore
   PORT=5000
   ```

5. **Start MongoDB**
   
   Make sure MongoDB is running on your system:
   ```bash
   # Windows
   net start MongoDB
   
   # macOS/Linux
   sudo systemctl start mongod
   ```

### Running the Application

1. **Start the Backend Server**
   ```bash
   cd backend
   npm start
   ```
   The server will run on `http://localhost:5000`
   
   Books will be automatically imported from `books.json` on first startup.

2. **Start the Frontend Application** (in a new terminal)
   ```bash
   cd frontend
   npm start
   ```
   The app will open in your browser at `http://localhost:3000`

---

##  How to Use

### For Customers

1. **Browse Books**
   - Visit the home page to see all available books
   - Use the search bar to find specific books by title or author

2. **View Book Details**
   - Click on any book card to see full details
   - View price, ISBN, category, and stock availability

3. **Add to Cart**
   - Click "Add to Basket" on any book
   - Adjust quantities as needed
   - You must be logged in to add items to cart

4. **Login/Register**
   - Click "Login" in the header
   - Enter your name and email (no password required for demo)
   - New users are automatically created

5. **Checkout**
   - Go to your basket (cart icon in header)
   - Review your items and discounts
   - Fill in delivery and payment information
   - Click "Complete Purchase" to finish

6. **Dark Mode**
   - Toggle the theme using the sun/moon icon in the header

7. **Currency Converter**
   - Use the dropdown in the header to select your preferred currency
   - Choose from EUR (€), USD ($), GBP (£), or JPY (¥)
   - All prices throughout the site update automatically
   - Your preference is saved in your browser

### For Admins

1. **Admin Login**
   - Go to `/admin-login`
   - Enter admin email and name

2. **Import Books**
   - Navigate to the Admin page
   - Upload a JSON file with book data
   - Books are automatically added to the database

---

##  Project Structure

```
bookstore/
├── backend/                 # Node.js/Express server
│   ├── models/             # MongoDB schemas
│   │   ├── Book.js         # Book model
│   │   ├── User.js         # User model
│   │   └── Purchase.js     # Purchase/Cart model
│   ├── routes/             # API route handlers
│   │   ├── books.js        # Book endpoints
│   │   ├── users.js        # User endpoints
│   │   └── purchases.js    # Purchase/Cart endpoints
│   ├── server.js           # Main server file
│   ├── importBooks.js      # Manual book import script
│   └── package.json        # Backend dependencies
│
├── frontend/               # React application
│   ├── public/             # Static files
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   │   ├── Header.js   # Navigation header
│   │   │   ├── Footer.js   # Page footer
│   │   │   ├── Login.js    # Login form
│   │   │   ├── Card.js     # Book card component
   │   │   ├── DarkModeToggle.js
   │   │   └── CurrencySelector.js
   │   ├── pages/          # Page components
   │   │   ├── BookList.js      # Home page
   │   │   ├── BookDetail.js    # Book detail page
   │   │   ├── Basket.js        # Shopping cart
   │   │   └── AdminImport.js   # Admin dashboard
   │   ├── context/        # React Context
   │   │   ├── DarkModeContext.js
   │   │   └── CurrencyContext.js
│   │   ├── App.js          # Main app component
│   │   └── index.js        # Entry point
│   └── package.json        # Frontend dependencies
│
├── books.json              # Sample book data
└── README.md               # This file
```

---

##  API Endpoints

### Books
- `GET /api/books` - Get all books
- `GET /api/books/:id` - Get single book by ID
- `POST /api/books` - Create new book (Admin)
- `POST /api/books/import` - Import books from JSON array (Admin)

### Users
- `GET /api/users` - Get all users
- `POST /api/users/login` - Login or create user
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user

### Purchases
- `GET /api/purchases/cart/:userId` - Get user's cart items
- `POST /api/purchases/add-to-cart` - Add book to cart
- `DELETE /api/purchases/:id` - Remove item from cart
- `POST /api/purchases/checkout` - Complete purchase

---

##  References

### React & JavaScript
- **React Documentation**: https://react.dev/
  - Used for: Component structure, hooks (useState, useEffect, useContext)
  - Sections: "Learn React", "API Reference"

- **React Router Documentation**: https://reactrouter.com/
  - Used for: Navigation, routing setup, useNavigate hook
  - Sections: "Tutorial", "Route Component"

- **MDN Web Docs - JavaScript**: https://developer.mozilla.org/en-US/docs/Web/JavaScript
  - Used for: Array methods (map, filter, reduce), fetch API, localStorage
  - Sections: "JavaScript Guide", "Web APIs"

- **MDN - Fetch API**: https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API
  - Used for: HTTP requests to backend API
  - Sections: "Using Fetch"

### Backend & Database
- **Express.js Documentation**: https://expressjs.com/
  - Used for: Server setup, routing, middleware
  - Sections: "Getting Started", "Routing", "Middleware"

- **Mongoose Documentation**: https://mongoosejs.com/
  - Used for: MongoDB schema definition, models, queries
  - Sections: "Schemas", "Models", "Queries"

- **MongoDB Manual**: https://www.mongodb.com/docs/manual/
  - Used for: Database concepts, CRUD operations
  - Sections: "Introduction", "CRUD Operations"

- **CORS Middleware**: https://www.npmjs.com/package/cors
  - Used for: Enabling cross-origin requests between frontend and backend

### CSS & Styling
- **Tailwind CSS Documentation**: https://tailwindcss.com/docs
  - Used for: Dark mode implementation, utility classes
  - Sections: "Dark Mode", "Customization"

- **CSS Tricks - Dark Mode**: https://css-tricks.com/a-complete-guide-to-dark-mode-on-the-web/
  - Used for: Dark mode implementation patterns and best practices

- **MDN - CSS**: https://developer.mozilla.org/en-US/docs/Web/CSS
  - Used for: Flexbox, Grid, transitions, gradients
  - Sections: "CSS Layout", "CSS Transforms"

### Design Patterns & Best Practices
- **React Context API**: https://react.dev/reference/react/useContext
  - Used for: Dark mode and currency state management across components
  - Sections: "useContext", "Context Provider Pattern"

- **REST API Design**: https://restfulapi.net/
  - Used for: API endpoint structure and HTTP methods

- **JavaScript Design Patterns**: https://www.patterns.dev/
  - Used for: Component patterns, state management patterns

### Currency & Internationalization
- **Number.toFixed()**: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/toFixed
  - Used for: Formatting currency values with decimal places

- **Exchange Rates Reference**: https://www.ecb.europa.eu/stats/policy_and_exchange_rates/euro_reference_exchange_rates/html/index.en.html
  - Used for: Understanding currency conversion and exchange rates
  - Note: In production, use live API like https://exchangerate-api.com/

- **Internationalization Best Practices**: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl
  - Used for: Currency formatting patterns and locale-specific number formatting

---


##  Contact

**Oisin Gibson**  
Student ID: L00172671  
Atlantic TU

---


