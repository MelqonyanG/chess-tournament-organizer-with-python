#!/bin/bash

python3 server.py &
npm start &
wait $(jobs -p)
dostuffwithresults &
trap 'exit 130' INT
wait $(jobs -p)
dostuffwithresults
