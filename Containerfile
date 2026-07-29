FROM docker.io/library/node:24-bookworm-slim AS dependencies
WORKDIR /workspace
COPY package.json package-lock.json ./
RUN npm ci

FROM dependencies AS build
COPY . .
RUN npm run build

FROM docker.io/library/nginx:1.29-alpine AS runtime
COPY --from=build /workspace/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
RUN chown -R 101:101 /usr/share/nginx/html
USER 101
EXPOSE 8080
