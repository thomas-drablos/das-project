# CS 6348 Final Project: Comet Commerce

## About
Comet Commerce is a simple e-commerce website that adheres to the [OWASP Top 10](https://owasp.org/Top10/), and has the beginnings of a Runtime Application Self-Protection or RASP system. Rather than other e-commerce sites where vendors list their products, comet commerce flips this on its head and instead intends to serve as a secure platform for customers to commission products from vendors.

## Running the Project (Without HTTPS Enabled)
This section will outline how to run the project locally on your machine for testing purposes. Please note that this explanation will assume that you wish to run the project without HTTPS enabled. For reasons that will be explained in section 3, HTTPS is disabled by default. This section should be the default way to run the project for testing purposes, however, we also provide a section for running the project with HTTPS enabled should you wish to test that feature out as well since that requires a bit more setup.

### Prerequisites
We are running this project using [Node.js](https://nodejs.org/en/download) running on version `v22.14.0`. Please ensure that you download this specific version of Node.js as older or more recent versions may not work with this project.

Please make sure that you are using the attached zip folder to the submission of this projet as it contains the neccessary `.env` file and the `secrets` folder, both of which are required for the project to run, but are not secure to be shared pulicly.

Within the root of this project, run the following commands in your terminal:
```cmd
npm install
cd server
npm install
npm start
```

This will first install all of the neccessary packages for the web-server, then do the same for the backend API server, and start the API server. Then, in a **second** terminal at the root of the project run the following command:
```cmd
npm run dev
```
This will start the front-end project. Please note that two terminals are required to run the project, as the front-end and back-end projects are separate. At this point, in your browser, navigate to [`http://localhost:5173`](http://localhost:5173) to view the project. 

## Running the Project (With HTTPS Enabled)
This section will outline how to run the project locally on your machine for testing the HTTPS enabled version of the project. Please note that this explanation will assume that you are running the project on a **Windows** machine, as the instructions for trusting the provided self-signed certificate are specific to the operating system being used.

### Reason for Difference in Setup
Since running the project with HTTPS enabled requires that certificates are not only provided, but also trusted by the browser, we have provided a self-signed certificate for testing purposes. Normally, trusing a self-signed certificate is not recommended, but for the purposes of this project, it is necessary to do so since purchasing a certificate would be prohibitively expensive for this project. However, the process for trusting the self-signed certificate requires a bit of extra work, so we have provided instructions for doing so, and is also why we don't ship the project files with the setup for HTTPS enabled since it does not work out of the box.

### Prerequisites
This uses the same prerequisites as the previous section, but also requires that you change some of the files provided. The following list outlines the needed steps to enable HTTPS:
1. First, within the provided [`.env`](/.env) file, change the `ENABLE_HTTPS` variable to `true`.
2. Second, within the [`vite.config.ts`](/vite.config.ts) file, please ensure that lines 5 through 9 match the following:
```ts
const SSL_PRIVATE_KEY = 'secrets/web.key';
const SSL_CERTIFICATE = 'secrets/web.crt';
const API_CERTIFICATE = 'secrets/api.crt';
const ENABLE_HTTPS = true;
const API_IS_USING_HTTPS = true;
```
3. Now, we need to trust the provided self-signed certificates...
    1. To do so, press `Win+R` and type `mmc` and then press `Enter`. This will open the Microsoft Management Console. Then, in the top-left corner, click on `File` > `Add/Remove Snap-ins` > `Certificates` > `Add` > `Computer Account` > `Next` > `Local Computer` > `Finish` > `OK`.
    2. Then, click on the newly added `Certificates (Local Computer)` folder, and then double-click on `Trusted Root Certification Authorities` and then right-click on `Certificates` > `All Tasks` > `Import` > `Next` > `Browse` > Navigate to the location of [`secrets/web.crt`](/secrets/web.crt) > `Open` > `Next` > `Place all certificates in the following store` > `Browse` > `Trusted Root Certification Authorities` > `OK` > `Next` > `Finish` > `OK`.
    3. Repeat the above steps for [`secrets/api.crt`](/secrets/api.crt).
4. Lastly, close out of all instances of web-browsers on your machine. This is required to ensure that the new certificates are recognized by the browser.

At this point, the certificate should be trusted by your computer and you shuold be able to navigate to [`https://localhost:5173`](https://localhost:5173) to view the project after going through the same setps to run the two components of the project as before. For a reminder of the steps, please see the following:

> Within the root of this project, run the following commands in your terminal:
> ```cmd
> npm install
> cd server
> npm install
> npm start
> ```
> 
> This will first install all of the neccessary packages for the web-server, then do the same for the backend API server, and start the API server. Then, in a **second** terminal at the root of the project run the following command:
> ```cmd
> npm run dev
> ```

## Authors
The project was completed, in whole, by the following students:
- Matthew Sheldon ([mts200002](mailto:mts200002@utdallas.edu)) 
- Elliot Agnew ([ega190000](mailto:ega190000@utdallas.edu))
- Isabella Pereira ([iap200002](mailto:iap200002@utdallas.edu))
- Rozhin Saadatfar ([rxs230083](mailto:rxs230083@utdallas.edu))
- Chloe Lee ([cyl190001](mailto:cyl190001@utdallas.edu))
- Akshitha Srinivasan ([axs230012](mailto:axs230012@utdallas.edu))
- Bhuvan Bolem ([btb170001](mailto:btb170001@utdallas.edu))
- Thomas Drablos

The project was completed as part of the "Data and Applications Security" course at the University of Texas at Dallas, taught by Dr. Ebru Cankaya during the Spring 2025 semester. 

## Special Thanks
Thank you to Thomas Drablos for his help with coordinating and brainstorming this project before his departure from the class. 