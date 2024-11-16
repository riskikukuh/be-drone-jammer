# Instalasi aplikasi jammer-statistik

* Instalasi NodeJS & NPM

  1. Install NVM

     ````bash	
     curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.38.0/install.sh | bash
     source ~/.bashrc
     ````

  2. Install nodejs versi tertentu ( yang digunakan v16.15.0 )

     ```bash
     nvm install v16.15.0 # Versi yang digunakan versi 16.15.0
     ```

  3. Selesai, dapat dilihat versi NodeJS & NPM

     ````bash
     node --version # melihat versi nodeJs
     npm --version # melihat versi npm
     ````

     ![image-20220916095225171](/home/tenky/.config/Typora/typora-user-images/image-20220916095225171.png)

     

* Aplikasi jammer-statistik

  1. Clone Backend Jammer Repository

     ````bash
     git clone https://github.com/riskikukuh/be-drone-jammer.git
     ````

  2. Install PostgreSQL

     ````bash
     sudo apt update 
     sudo apt install postgresql postgresql-contrib # Memasang postgresql
     sudo systemctl start postgresql.service # Memulai PostgreSQL service
     ````

  3. Login to PostgreSQL 

     ```bash
     sudo -i -u postgres 
     psql # memulai postgresql CLI
     CREATE DATABASE drone_jammer; # Membuat database
     
     CREATE USER <username> WITH PASSWORD '<password>'; # Membuat user baru
     GRANT ALL PRIVILEGES ON DATABASE drone_jammer to <username>; # Memberikan akses penuh ke database drone_jammer ke <username>
     ```

  4. Install node module

     ````bash
     npm install
     ````

  5. Buat file environment ( .env ) di root

     ````env
     # Server Configuration
     HOST=0.0.0.0
     PORT=8000
     
     # PostgreSQL Configuration
     PGUSER=<< Your Username >>
     PGHOST=<< Your Host >>
     PGPASSWORD=<< Password >>
     PGDATABASE=<< Nama database >> 
     PGPORT=5432
     ````

  6. Jalankan migrasi database

     ````bash
     npm run migrate up
     ````

  7. Memulai server

     ````bash
     npm run start-dev # for Development purposes
     npm run start-prod # for Deployment purposes
     ````

     

* Forwarding dengan Localtunnel ( https://theboroer.github.io/localtunnel-www/ )

  1. Pastikan sudah terinstall npm

  2. Install Localtunnel

     ````bash
     npm install -g localtunnel
     ````

  3. Jalankan forwarding menggunakan localtunel 

     ````bash
     lt --port 8000 # Port
     ````

     ![Screenshot from 2022-09-15 15-24-58](/home/tenky/Pictures/Screenshot from 2022-09-15 15-24-58.png)

  4. Selesai

     

* Forwarding dengan NGROK ( **Issue** )

  1. Install NGROK ( Linux )

     ````bas
      sudo tar xvzf ~/Downloads/ngrok-v3-stable-linux-amd64.tgz -C /usr/local/bin 
     ````

  2. Cek hasil instalasi ( opsional )

     ````bash
     ngrok --version # jika bash mengembalikan versi ngrok, maka installasi telah berhasil
     ````

  3. Jalankan forwarding menggunakan NGROK

     ````bash	
     ngrok http 8000 # 8000 adalah port yang diforward
     ````

     ![Deployment Status](/home/tenky/Pictures/Screenshot from 2022-09-07 11-12-23.png)

  4. Selesai

