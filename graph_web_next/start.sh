#!/bin/bash
exec gunicorn -w 4 -b 0.0.0.0:5002 -t 600 graph_web:app
