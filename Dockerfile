FROM node:16-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Create a volume mount point
RUN mkdir -p /Falgun_PV_dir

ENV STORAGE_DIR=/Falgun_PV_dir
ENV PORT=3001

EXPOSE 3001

CMD ["node", "app.js"]