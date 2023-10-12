import { Keypair } from "@solana/web3.js";
import { TokenStandard, createAndMint } from '@metaplex-foundation/mpl-token-metadata';
import { UploadMetadataInput } from '@metaplex-foundation/js';
import { bundlrUploader } from "@metaplex-foundation/umi-uploader-bundlr";
import { createUmi } from '@metaplex-foundation/umi-bundle-defaults'
import { mplTokenMetadata } from '@metaplex-foundation/mpl-token-metadata'
import { createSignerFromKeypair, keypairIdentity, percentAmount, } from "@metaplex-foundation/umi";
import { fromWeb3JsKeypair, fromWeb3JsPublicKey } from "@metaplex-foundation/umi-web3js-adapters";
import { base58 } from "@metaplex-foundation/umi/serializers";

import secret from './mint_authority.json';
import mint from "./sync_mint.json";

const endpoint = 'https://api.mainnet-beta.solana.com';
const TRILLIONS = 10_000_000_000_000_000_000n; // 100T + 5 zeros since we have 5 decimals
const userWallet = Keypair.fromSecretKey(new Uint8Array(secret));

// Use the RPC endpoint of your choice.
const umi = createUmi(endpoint)
    .use(mplTokenMetadata())
    .use(keypairIdentity(fromWeb3JsKeypair(userWallet)))
    .use(bundlrUploader({
        address: "https://node1.bundlr.network" // mainnet
    }));

const mintFungibleToken = async () => {
    const MY_TOKEN_METADATA = {
        name: "name",
        symbol: "symbol",
        image: "LINK",
        description: "Sync - Welcome to the realm of unparalleled delegated proof of micromanagement, where you can safely microstake and delegate. Embrace and respect the Sync! Be the Sync!"
    }

    // upload off-chain data
    const uri = await umi.uploader.uploadJson({ ...MY_TOKEN_METADATA });

    // create mint
    const mintAddress = createSignerFromKeypair(umi, fromWeb3JsKeypair(Keypair.fromSecretKey(new Uint8Array(mint))));
    console.log("Mint: " + mintAddress.publicKey);

    const createAndMintTx = await createAndMint(umi, {
        mint: mintAddress,
        authority: umi.identity,
        amount: TRILLIONS,
        name: MY_TOKEN_METADATA.name,
        symbol: MY_TOKEN_METADATA.symbol,
        decimals: 5,
        uri,
        sellerFeeBasisPoints: percentAmount(0),
        tokenStandard: TokenStandard.Fungible,
        tokenOwner: fromWeb3JsPublicKey(userWallet.publicKey),
        creators: null,
        collection: null,
        uses: null,
    }).sendAndConfirm(umi);

    console.log("Mint token signature: " + base58.deserialize(createAndMintTx.signature)[0]);
}

mintFungibleToken().catch((err) => {
    console.error(err);
})
