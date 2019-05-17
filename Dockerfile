FROM node:12.2.0

EXPOSE 3001

# Build front end first
COPY web/ /app/web/
WORKDIR /app/web/
RUN npm ci && npm run build

WORKDIR /app
COPY package.json package-lock.json index.js ./
RUN npm ci
CMD node index.js
