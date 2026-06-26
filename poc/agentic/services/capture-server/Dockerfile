FROM node:22-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY src/ ./src/
EXPOSE 9001 4318 80
CMD ["node", "--experimental-strip-types", "src/index.ts"]
