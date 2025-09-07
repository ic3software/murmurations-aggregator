# Murmurations Aggregator

## Local Setup Guide

This guide will help you set up and run the Murmurations Aggregator locally. Follow the steps in order to ensure a smooth installation.

## 1. Configure Environment Variables

First, copy the example environment file:

``` bash
cp .env.example .env
```

Next, configure the Murmuration Services URLs. You can use the provided
test services or run your own using
[MurmurationServices](https://github.com/MurmurationsNetwork/MurmurationsServices):

``` bash
PUBLIC_INDEX_URL=https://test-index.murmurations.network
PUBLIC_LIBRARY_URL=https://test-library.murmurations.network
PUBLIC_DATA_PROXY_URL=https://test-data-proxy.murmurations.network
```

Set the Aggregator's Tools URL:

``` bash
PUBLIC_TOOLS_URL=http://localhost:5173
```

Finally, configure the **Resend API Key** for email-based account
recovery. You can create a free account at
[Resend](https://resend.com/signup):

``` bash
PRIVATE_RESEND_KEY=<YOUR_API_KEY>
```

## 2. Generate UCAN Server Keys

Run the following command to generate UCAN server keys. Copy the output
into your `.env` file:

``` bash
pnpm generate-server-keys
```

Example output:

``` bash
✅ Generated server keys successfully!

Please add the following to your .env file:

PUBLIC_SERVER_DID_KEY=did:key:z6MkwEzW43zy5CJ4rSscCA4N6EpFGK6WHbFQrg8NxomZoEJS
PRIVATE_SERVER_KEY=SClA0WPgndVIBcYMy9KNc2SVcsEFJEjGQdyxTNHTc+75ciH16VlgrKUcw/x8t6btDeb5FpvQwk2g8AVqIZPbdw==
```

## 3. Set Up the Database

Murmurations Aggregator uses **Cloudflare D1** as its database.

Run the migration command to initialize the local database:

``` bash
pnpm db:migrate
```

This will create a `.wrangler` folder containing a local SQLite database
in `.wrangler/d1/`, which you can use for local testing and preview.

## 4. Install Dependencies and Run the App

Install the required packages:

``` bash
pnpm install
```

Start the development server:

``` bash
pnpm dev
```

Your application should now be available locally at: [http://localhost:5173](http://localhost:5173)
