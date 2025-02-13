# Setup

1. Download [NodeJS](https://nodejs.org/en)

   I'm currently using the latest LTS version `v22.14.0`.

2. Clone the project repo

   I had to setup SSH credentials in order to have write permissions for the repo,
   so my clone command looks like:

   ```git clone ssh://git@github.com/thomas-drablos/das-project.git```

3. Install javascript dependencies

   ```npm ci```

4. Setup python virtual environment

   * Unix

     ```
     python3 -m venv env
     env/bin/pip install --upgrade pip
     env/bin/pip install -r requirements.txt
     ``` 

   * Windows

     ```
     python3 -m venv env
     env\Scripts\pip install --upgrade pip
     env\Scripts\pip install -r requirements.txt
     ```

5. Launch front-end and back-end servers (you'll need two shells)

   * Unix

   ```
   # Back-end Python Server (Shell 1)
   env/bin/fastapi dev server/main.py

   # Front-end Javascript Server (Shell 2) 
   npm run dev
   ```

   * Windows

   ```
   # Back-end Python Server (Shell 1)
   env\Scripts\fastapi dev server\main.py

   # Front-end Javascript Server (Shell 2)
   npm run dev
   ```
