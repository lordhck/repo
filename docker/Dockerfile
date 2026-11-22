ARG ALPINE_VERSION=3.22
FROM alpine:${ALPINE_VERSION}

RUN apk add --no-cache bash openssl tar xz

COPY repo /usr/local/bin/repo

ENV PS1='corepkgs:\w\$ '
WORKDIR /srv/repo

CMD ["bash", "--norc"]
