FROM node:5-onbuild

RUN apt-get -y update

RUN git clone https://github.com/Thomas-T/nodebjectify.git /root/nodebjectify
RUN cd /root/nodebjectify
RUN git checkout develop
RUN npm i
