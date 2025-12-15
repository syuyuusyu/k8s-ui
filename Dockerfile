FROM nginx:alpine
COPY ./build /var/www
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 8000
ENTRYPOINT ["nginx","-g","daemon off;"]