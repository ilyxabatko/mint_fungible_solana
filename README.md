## Simple script to mint a Fungible Solana tokens (decimals >= 0 AND supply can be > 1) utilizing the Umi JS SDK powered by Metaplex Foundation. 

Install dependencies:
`yarn install`

In order to run the script, you have to have that "secret.json" and "mint_authority.json" keypairs OR generate them at least. Also, don't forget to set desired data to the MY_TOKEN_METADATA object.

Then run the script:
`ts-node mint.rs`