@ECHO OFF

:: Put your PHP path here. Keep it blank to use from PATH env
SET PHPEXE=""

IF %PHPEXE%="" (
    PHPEXE="php"
)

%PHPEXE% -S localhost:8000