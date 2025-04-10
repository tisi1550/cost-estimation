# Stage 1: Build the React app
FROM node:18 as build

WORKDIR /app
COPY . .

# Install dependencies & build the app
RUN npm install
RUN npm run build

# Stage 2: Serve the app with Nginx
FROM nginx:alpine

# Copy build output
COPY --from=build /app/build /usr/share/nginx/html

# Remove default config and add custom one
RUN rm /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose the port Cloud Run expects
EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]