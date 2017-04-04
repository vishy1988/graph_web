#!/bin/bash

docker kill graph_web_test &&\
docker rm graph_web_test &&\
docker rmi graph_web_test &&\
docker build -t graph_web_test .
docker run -d -p 5002:5002 --name=graph_web_test graph_web_test ./start.sh


