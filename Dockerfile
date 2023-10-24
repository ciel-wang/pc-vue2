FROM nginx
MAINTAINER iot_www_page@qq.com

RUN mkdir -p /iot
ADD ./dist /usr/share/nginx/html
ADD ngx.conf /etc/nginx/conf.d/ngx.conf

