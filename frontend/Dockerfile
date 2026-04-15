FROM node:22-alpine
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy the remaining frontend source code
COPY . .

# Expose the default Vite port
EXPOSE 5173

# Start the Vite development server and expose it to the local network
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]