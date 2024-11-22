const { PassThrough } = require('stream');
const AWS = require('aws-sdk');


async function mergeChunks(fileId, totalChunks) {
    const mergedFileKey = `videos/${fileId}.webm`;

    const writeStream = new PassThrough();
    const BUCKET_NAME = 'rock-bucket';

    // Upload the merged file back to S3
    const uploadParams = {
        Bucket: BUCKET_NAME,
        Key: mergedFileKey,
        Body: writeStream,
        ContentType: 'video/webm',
    };

    const s3 = new AWS.S3();

    const uploadPromise = s3.upload(uploadParams).promise();

    for (let i = 0; i < totalChunks; i++) {
        const chunkKey = `videos/${fileId}_${i}.webm`;
        const chunkStream = s3.getObject({ Bucket: BUCKET_NAME, Key: chunkKey }).createReadStream();
        await new Promise((resolve, reject) => {
            chunkStream.pipe(writeStream, { end: false });
            chunkStream.on('end', resolve);
            chunkStream.on('error', reject);
        });

        // Optionally, delete the chunk from S3
        await s3.deleteObject({ Bucket: BUCKET_NAME, Key: chunkKey }).promise();
    }

    // End the write stream to complete the merged file upload
    writeStream.end();

    // Wait for the upload to complete
    await uploadPromise;
}

module.exports = mergeChunks