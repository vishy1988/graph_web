#!/bin/bash

exec gunicorn -c server_config.py flask_run:app
