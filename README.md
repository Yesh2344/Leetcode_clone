# Leetcode Clone
Ever tried to Clone what leetcode does? Here it is.
# Initial Setup
  
This is a project built with [Chef](https://chef.convex.dev) using [Convex](https://convex.dev) as its backend.
  
This project is connected to the Convex deployment named [`veracious-ermine-502`](https://dashboard.convex.dev/d/veracious-ermine-502).
  
## Project structure
  
The frontend code is in the `app` directory and is built with [Vite](https://vitejs.dev/).
  
The backend code is in the `convex` directory.
  
`npm run dev` will start the frontend and backend servers.

## App authentication

Chef apps use [Convex Auth](https://auth.convex.dev/) with Anonymous auth for easy sign in. You may wish to change this before deploying your app.

## Developing and deploying your app



## HTTP API

User-defined http routes are defined in the `convex/router.ts` file. We split these routes into a separate file from `convex/http.ts` to allow us to prevent the LLM from modifying the authentication routes.
"# Leetcode_clone" 


## Copyrights

@Yeswanth Soma All Copyrights Reserved

## Contact

Email:yeswanthsoma83@gmail.com
