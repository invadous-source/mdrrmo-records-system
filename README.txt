MDRRMO BINANGONAN - EMERGENCY RECORDS SYSTEM

RUNNING
Double-click start.bat. It starts the local server and opens http://127.0.0.1:8765/.
Do not open index.html directly for normal operation.

PERSISTENT LOCAL DATABASE
All records are stored in data\database.json beside MDRRMO_Binangonan.exe.
Add, edit, and delete operations write to that file immediately using an atomic
replace. Closing the browser or restarting the server does NOT erase records.
Copy the complete MDRRMO_Binangonan_System folder to another Windows PC to
move the database with the application.

RECORD TYPES
1. Accidents
2. Conductions
3. Trainings
4. Cutting Trees
5. Fire Incidents Responded
6. Clearing Operations

IMPORTANT
This is a portable single-PC database. It is not a shared multi-PC live database.

NO INTERNET
The UI and database server run locally on 127.0.0.1:8765.
