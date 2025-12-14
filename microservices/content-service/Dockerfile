FROM node:18-alpine

WORKDIR /app

COPY package.json .
RUN npm install

COPY server.js .

# Crear directorio de uploads
RUN mkdir -p uploads

EXPOSE 3003

HEALTHCHECK --interval=10s --timeout=5s --retries=5 \
  CMD node -e "require('http').get('http://localhost:3003/health', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

CMD ["node", "server.js"]
