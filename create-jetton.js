require("dotenv").config();
const { mnemonicToPrivateKey } = require("@ton/crypto");
const { TonClient, WalletContractV4, toNano, Address } = require("@ton/ton");
const { JettonMinter } = require("@ton/ton/dist/contracts/token/jetton-minter");

const endpoint = "https://testnet.toncenter.com/api/v2/jsonRPC"; // Testnet

async function main() {
    const mnemonic = process.env.MNEMONIC?.split(" ");
    if (!mnemonic || mnemonic.length !== 24) {
        throw new Error("❌ Укажи seed-фразу в .env как MNEMONIC");
    }

    const keyPair = await mnemonicToPrivateKey(mnemonic);

    const wallet = WalletContractV4.create({
        workchain: 0,
        publicKey: keyPair.publicKey,
    });

    const client = new TonClient({ endpoint });

    const balance = await client.getBalance(wallet.address);
    console.log("🔐 Кошелёк:", wallet.address.toString());
    console.log("💰 Баланс TON:", Number(balance) / 1e9);

    if (balance < toNano("0.5")) {
        console.log("⚠️ Пополни кошелёк через https://test.ton.org/faucet");
        return;
    }

    const metadataUri = "https://yourdomain.com/jetton-meta.json";

    const jetton = await JettonMinter.create(client, keyPair, {
        owner: wallet.address,
        content: {
            type: "offchain",
            uri: metadataUri,
        },
        amount: toNano("1000"), // Кол-во токенов
    });

    console.log("✅ Jetton создан!");
    console.log("🪙 Адрес Jetton:", jetton.address.toString());
}

main().catch(console.error);
