# Installation Backend remote-jammer

* Application

  1. Clone Backend Jammer Repository

     ````bash
     git clone https://github.com/riskikukuh/be-drone-jammer.git
     ````

  2. Install PostgreSQL

     ````bash
     sudo apt update 
     sudo apt install postgresql postgresql-contrib # Install postgresql
     sudo systemctl start postgresql.service # Start PostgreSQL service
     ````

  3. Login to PostgreSQL 

     ```bash
     sudo -i -u postgres 
     psql # Start postgresql CLI
     CREATE DATABASE remote_jammer; # Create database
     
     CREATE USER <username> WITH PASSWORD '<password>'; # Create new user for interacting with postgre
     GRANT ALL PRIVILEGES ON DATABASE remote_jammer to <username>; # Give full access database remote_jammer to <username>
     ```

  4. Install node modules

     ````bash
     npm install
     ````

  5. Setup file environment ( .env )

     ````env
     # Server Configuration
     HOST=0.0.0.0
     PORT=8000
     
     # PostgreSQL Configuration
     PGUSER=<< Your Username >>
     PGHOST=<< Your Host >>
     PGPASSWORD=<< Password >>
     PGDATABASE=<< Database name created before >> 
     PGPORT=5432
     ````

  6. Run migrations

     ````bash
     npm run migrate
     ````

  7. Start server

     ````bash
     npm run start-dev # for Development purposes
     npm run start-prod # for Deployment purposes
     ````

     

* Deployment with NGROK

  1. Install NGROK ( Linux )

     ````bas
      sudo tar xvzf ~/Downloads/ngrok-v3-stable-linux-amd64.tgz -C /usr/local/bin 
     ````

  2. Check installation ( optional )

     ````bash
     ngrok --version # if bash returned version of ngrok, it means installation ngrok success
     ````

  3. Run deployment with NGROK

     ````bash	
     sudo ngrok http 8000 # 8000 is server port
     ````

     ![Deployment Status](/home/tenky/Pictures/Screenshot from 2022-09-07 11-12-23.png)

  4. Done

