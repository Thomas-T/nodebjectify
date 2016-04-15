FROM node:5.10.1

RUN apt-get -y update
RUN apt-get install -y curl python openjdk-7-jdk supervisor build-essential libevent-dev libsasl2-2 sasl2-bin libsasl2-2 libsasl2-dev libsasl2-modules memcached
RUN mkdir -p /var/log/supervisor

RUN curl https://sdk.cloud.google.com | bash

ENV CLOUDSDK_CORE_DISABLE_PROMPTS 1
ENV CLOUDSDK_CORE_PROJECT p0

RUN /root/google-cloud-sdk/bin/gcloud config set project $CLOUDSDK_CORE_PROJECT
RUN /root/google-cloud-sdk/bin/gcloud components install beta
RUN /root/google-cloud-sdk/bin/gcloud components install gcd-emulator



COPY supervisord.conf /etc/supervisor/conf.d/supervisord.conf

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app
COPY package.json /usr/src/app/
RUN npm install
COPY . /usr/src/app

COPY start-docker.sh /usr/src/
