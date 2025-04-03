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

5. Error checking and linting

   Both front-end and back-end projects support the same commands.

   To run TypeScript error checking (this seems to be stricter, so is prefered over lint)
   ```
   npm run build
   ```

   To run linter
   ```
   npm run lint
   ```
