This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).


## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Run the Database JSON server: 

```bash 
# Install globally JSON-server first
npm install -g json-server 

# Run the server
json-server --watch db.json --port 3003
```

## Run both with foreman 

Install foreman to run the two servers at the same time: `gem install foreman`. 

Then run both with `foreman start`. 


### JSON Server managmeent

The JSON export must contain a study with only one key
as pointed out there: https://github.com/typicode/json-server/issues/435 . 

In the current export you must clean the first keys and keep the groups
or add a study key. Remove the first `{`. 

``` json
{"studies" : [{"id": "toto", ... JSON ... ]} 
```

The script in the `convert` folder allow the conversion from 
current Peac²h to `db.json`. 

- https://app.peac2h.io,  October 2023.   

Go to the covert folder and follow the [README](./convert/README.md) instructions. 
