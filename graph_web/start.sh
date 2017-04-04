#!/bin/bash
exec gunicorn -c server_config.py graph_web:app
