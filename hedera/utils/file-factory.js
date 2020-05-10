const hedera = require('@hashgraph/sdk');

const BYTE_CHUNKS_SIZE = 4000;

class FileFactory {

    constructor(client, publicKey) {
        this.client = client;
        this.publicKey = publicKey;
    }

    async createFile (bytes) {
        const chunks = Math.floor(bytes.length / BYTE_CHUNKS_SIZE);
        const firstChunk = copyBytes(0, BYTE_CHUNKS_SIZE, bytes);

        const transaction = new hedera.FileCreateTransaction();
        transaction.setMaxTransactionFee(new hedera.Hbar(10));
        transaction.addKey(this.publicKey);
        transaction.setContents(firstChunk);

        const receipt = await (await transaction.execute(this.client)).getReceipt(this.client);
        const fileId = receipt.getFileId();

        for (let i = 1; i < chunks; i++) {
            const chunkBytes = copyBytes(i * BYTE_CHUNKS_SIZE, BYTE_CHUNKS_SIZE, bytes);
            await this.appendToFile(fileId, chunkBytes);
        }

        const reminderChunk = bytes.length % BYTE_CHUNKS_SIZE;
        if (reminderChunk > 0) {
            const remindedBytes = copyBytes(chunks * BYTE_CHUNKS_SIZE, reminderChunk, bytes);
            await this.appendToFile(fileId, remindedBytes);
        }

        return fileId;
    }

    async appendToFile (fileId, bytes) {
        const transaction = new hedera.FileAppendTransaction();
        transaction.setFileId(fileId);
        transaction.setMaxTransactionFee(new hedera.Hbar(5));
        transaction.setContents(bytes);

        return transaction.execute(this.client);
    }
}

const copyBytes = function (start, length, bytes) {
    let bytesCopy = '';
    for (let i = 0; i < length; i++) {
        bytesCopy += bytes[start + i];
    }

    return bytesCopy;
}

module.exports = FileFactory;
