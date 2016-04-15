#!/bin/bash
docker build -t ttiercelin/nodebjectify-node .;
docker run --rm=true ttiercelin/nodebjectify-node /bin/sh -c "/usr/src/start-docker.sh"; # -c "npm run docker-test";
