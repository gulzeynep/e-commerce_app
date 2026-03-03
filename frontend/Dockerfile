FROM node:22-alpine
WORKDIR /app
RUN rm -rf node_modules
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 5173
# we need --host to make vite accessible from outside  
CMD ["npm", "run", "dev", "--", "--host"]