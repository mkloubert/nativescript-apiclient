@ECHO OFF
CLS

CALL tns plugin remove nativescript-apiclient
CALL tns plugin add ..\plugin

CALL tns livesync --watch
