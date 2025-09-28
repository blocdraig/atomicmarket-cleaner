# AtomicMarket Cleaner

This script will cancel invalid sales on atomicmarket contract.

It will check for invalid sales every 60 seconds and cancel them if they are found.

## Installation

This script requires Node.js >=20 and NPM.

Clone the repository with `git clone` and `cd` into the directory.

Install the required packages with `npm ci`.

## Usage

Then run the script with `npm run start`.

## Environment Variables

The following environment variables are required:

- `ACTOR`: The account to use for the transaction
- `PERMISSION`: The permission to use for the transaction
- `CHAIN_ID`: The chain ID
- `CHAIN_URL`: The chain URL
- `PRIVATE_KEY`: The private key
- `ATOMIC_URL`: The AtomicAssets API URL (must have atomicmarket enabled)

## Best Practices

It is best to use a unique private key on a permission that can only call the atomicmarket::cancelsale action.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
