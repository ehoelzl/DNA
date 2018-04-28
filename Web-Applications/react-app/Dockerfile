
# Stage 2 - the production environment
FROM nginx:1.12-alpine
COPY ./build_webpack /usr/share/nginx/html
VOLUME /usr/share/nginx/html
VOLUME /etc/nginx
EXPOSE 80
