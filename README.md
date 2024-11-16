# Car Management App

Car Management Application where users can create, view, edit, and delete cars. Each car can
contain up to 10 images (specifically of a car), a title, a description and tags - car_type, company, dealer...etc . The application includes user authentication, allow users to manage only their products, and provide search functionality across products.

https://github.com/user-attachments/assets/2bce0288-5a79-4268-a9bf-47b1fd118289

## Live Demo

Try the App live here:
- **Frontend**: [Car Management App (Live)](https://aman-spyne-car-app.vercel.app/)
- **Backend API**: [Car Management App API (Live)](https://aman-spyne-car-app.onrender.com)

## API Documentation 

- **Swagger API Docs**: [Car Management App API Docs](https://aman-spyne-car-app.onrender.com/api-docs)


## Features

- User can login/signup
- Users can add a car with upto 10 images, title, description and tags
- Users can view a list of all their cars.
- Users can global search through all their cars i.e the keyword searched will list all cars whose title, description, tags match the keyword.
- Users can click on a car to view particular car’s detail
- Users can update a car’s title, description, tags, or image.
- Users can delete a car.

## Tech Stack

- **Frontend**: ReactJS
- **Backend**: NodeJS
- **Database**: MongoDB, Cloudinary



## Installation for running locally

### Prerequisites

- [Node.js](https://nodejs.org/)

### Steps

1. **Clone the Repository**
   ```bash
   git clone https://github.com/AmanAditya-1/aman-spyne-car-app.git

2. **Install Frontend Dependencies**
   ```bash
   cd frontend
   npm install

3. **Backend Environment Variables**
   ```bash
   MONGODB_URI=
   JWT_SECRET=
   PORT=5000
   CLOUDINARY_CLOUD_NAME=
   CLOUDINARY_API_KEY=
   CLOUDINARY_API_SECRET=



4. **Frontend Environment Variables**
   ```bash
   REACT_APP_API_URL=

5. **Start the backend server**
   ```bash
   cd backend
   nodemon server.js

6. **Start the frontend server**
   ```bash
   cd frontend
   npm start

7. **Open your browser and go to http://localhost:3000.**







