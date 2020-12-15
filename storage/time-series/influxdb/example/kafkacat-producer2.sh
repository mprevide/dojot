#!/bin/bash

sleep 20

kafkacat -b kafka:9092 -P -t admin.device-data -l /file.txt