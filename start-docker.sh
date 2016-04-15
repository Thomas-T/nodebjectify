#!/bin/bash
nohup /usr/bin/supervisord > /dev/null 2>&1 &
npm run coverage
