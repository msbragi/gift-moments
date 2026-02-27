#!/bin/bash
# filepath: /workspace/angular/time-caps/tc-be/database/reverse.sh

npx typeorm-model-generator \
    -h host.docker.internal \
    -d tc_data \
    -u joomla \
    -x joomla \
    -e mysql -o ./schema