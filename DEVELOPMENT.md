# Setup

1. Download [NodeJS](https://nodejs.org/en)

   I'm currently using the latest LTS version `v22.14.0`.

2. Clone the project repo

   I had to setup SSH credentials in order to have write permissions for the repo,
   so my clone command looks like:

   ```git clone ssh://git@github.com/thomas-drablos/das-project.git```

3. Install javascript dependencies

   There are 2 nested projects in this repository. The first is the front-end project,
   located at the project root. The second is the back-end project located at `server/`.
   Run the following command in both of these projects.

   ```npm install```

4. Create .env file

   `.env` is the source of environment variables used in the project. Mostly this
   consists of secrets. `template.env` is provided to give a starter for the contents of
   `.env`, simply populate the listed variables.

   `DB_CONN_STRING` is the only mandatory field. This is your MongoDB connection
   string which can be found from your DB hosting platoform, or refer to a
   locally hosted mongodb instance.

   For information about SSL encryption see section 5. Hosting and HTTPS.

4. Launch front-end and back-end servers (you'll need two shells)

   Start both servers by running one of the following commands in both of the shells

   * Development mode
      ```
      npm run dev
      ```
      This command will watch and automatically rebuild when a project file is changed. The front-end will force the browser to refresh when reloading. 

      Does not perform full TypeScript error checking, so be sure to `build` the project periodically.

   * Non-development mode
      ```
      npm start
      ```
      Performs full TypeScript error checking and does not watch for changes.

5. Hosting and HTTPS

   By defualt, TLS encryption is disabled and both the web server and API server will
   communicate over HTTP. This is for development environments only. To enable HTTPS (TLS
   encryption), provide a certicate/private key pair for each server (web [vite] and
   API [express]) in a secure location. Populate the variables in .env and vite.config.ts
   with links to these files. Then set ENABLE_HTTPS in both .env and vite.config.ts to true.

   If using self-signed certificates for testing (not acceptable for production), the
   below command is what we used to generate the keys.

   ```
   openssl req -x509 -newkey rsa:4096 -keyout key.pem -out cert.pem -sha256 -nodes -days 365 -subj "/CN=localhost" -addext subjectAltName=DNS:localhost,IP:127.0.0.1
   ```

   Note that you will have to bypass an untrusted certificated warning. If you choose to
   install the self-signed certificate in your browser or OS certificate manager (mind
   the risks of trusting a self-signed cert), note that some browsers have differing
   requirements about accepting a certificate, so the above command may not produce an
   acceptable certificate for all browsers.

6. Error checking and linting

   Both front-end and back-end projects support the same commands.

   To run TypeScript error checking (this seems to be stricter, so is prefered over lint)
   ```
   npm run build
   ```

   To run linter
   ```
   npm run lint
   ```
