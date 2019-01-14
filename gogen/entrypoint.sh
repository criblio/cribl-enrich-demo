#!/bin/sh
mkdir -p /var/log/gogen
mkdir /var/log/beats

if [ "$1" = "start-direct" ]; then
    gogen -v -cd /etc/gogen -o tcp --url cribl:10001 -ot json -at gen
fi

exec "$@"
