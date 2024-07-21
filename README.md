# E-Commerce Node Website

Welcome to my E-Commerce Website! This repository contains the codebase for a fully functional full stack e-commerce website built using React and Node. Whether you're a developer looking to contribute or a user interested in setting up your own online store, this README will guide you through the project setup and usage.

## Features

- User authentication: Sign up, login, and logout functionalities with web tokens.
- Authorization: Separate functionalities authorized for customers and admins
- Product browsing: Browse products, view product details, and add products to the shopping cart.
- Shopping cart management: View, add, remove, and update products in the shopping cart.
- Checkout process: Check the products, choose payment methods, and place orders.
- Admin panel: Add products and edit products.

## Technologies Used

- **React**: Frontend UI library
- **Node**: Backend runtime environment for handling API calls
- **Express**: Web application framework for Node
- **MongoDB**: NoSQL database for storing user, product, session and order data
- **Stripe**: Payment processing API for handling online payments
- **HTML/CSS/JavaScript**: Frontend development technologies

## Prerequisites

Before you begin, ensure you have the following installed:

- Node and npm: [Download Node](https://nodejs.org/)
- React: [Create React App] (https://react.dev/)
- MongoDB: [Download MongoDB](https://www.mongodb.com/)

## Getting Started

1. Clone the repository:

    ```bash
    git clone https://github.com/Dodo-sr13/ecommerce-website.git
    ```

2. Navigate into the project directory:

    ```bash
    cd ecommerce-website
    ```
3. Navigate to client and server directories

   ```bash
    cd client
    cd server
    ```

4. Install dependencies:

    ```bash
    npm install
    ```

5. Set up environment variables:
   
    Create a `.env` file in the root directory and add the following variables:

    ```plaintext
    MONGODB_URI=your_mongodb_connection_uri
    API_KEY=your_api_key
    DOMAIN=your_domain
    ```

6. Run the application:

    ```bash
    npm start
    ```

6. Open your browser and navigate to `http://localhost:3000` to access the website.

## Contributing

Contributions are welcome! If you'd like to contribute to this project, please follow these steps:

1. Fork the repository.
2. Create a new branch (`git checkout -b feature/your-feature-name`).
3. Make your changes.
4. Commit your changes (`git commit -am 'Add new feature'`).
5. Push to the branch (`git push origin feature/your-feature-name`).
6. Create a new Pull Request.


## Support

If you encounter any issues or have any questions, please feel free to [create an issue](https://github.com/Dodo-sr13/ecommerce-website/issues). We're here to help!

## Future work

1. Working on styling and creating dynamic product cards
2. Adding categories to the products page
3. Implementing real life payments

---

Thank you for using the E-Commerce Website. Happy shopping! 🛒🚀
