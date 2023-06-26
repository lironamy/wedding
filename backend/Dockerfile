# Use a base image with Node.js
FROM node:18.3.0-alpine3.14

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the entire application code to the container
COPY . .

# Expose the port your application listens on
EXPOSE 5000

# Start the application
CMD ["node", "app.js"]


