# Specify the base image
FROM node:16-alpine

# Set the working directory inside the container
WORKDIR /src

# Install ffmpeg
RUN apk add --no-cache ffmpeg

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code to the working directory
COPY . .

# Expose the port on which the application will run
EXPOSE 5000

# Start the application
CMD [ "npm", "start" ]
