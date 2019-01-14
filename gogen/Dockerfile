FROM alpine:latest
ADD https://api.gogen.io/linux/gogen /usr/bin/gogen
RUN chmod 755 /usr/bin/gogen
ADD gogen /etc/gogen
ADD entrypoint.sh /sbin/entrypoint.sh
ENTRYPOINT ["/sbin/entrypoint.sh"]
CMD ["start-direct"]
