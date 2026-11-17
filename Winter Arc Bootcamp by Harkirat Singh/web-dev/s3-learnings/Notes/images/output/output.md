// -------------------------------- presign POST fetch call --------------------------------

Request URL - http://localhost:8000/presign
Request method - POST
Status code - 200 OK
Remote address - [::1]:8000
Referrer policy - strict-origin-when-cross-origin

payload:
{
"fileName": "Screenshot 2026-11-13 at 16.25.18.png",
"fileType": "image/png"
}

response:
{
"signedUrl": "https://ai-memory-image-storage.s3.ap-southeast-2.amazonaws.com/uploads/1794578073871-95d30e50-6fc9-4162-a705-caed2360cf5f.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=AKIAQREPIFGYP57RNVE3%2F20261113%2Fap-southeast-2%2Fs3%2Faws4_request&X-Amz-Date=20261113T135433Z&X-Amz-Expires=60&X-Amz-Signature=599d20750443b59bb97d4c94211fb21ae2406eccd523401cfeebeaeeca153cdb&X-Amz-SignedHeaders=host&x-amz-checksum-crc32=AAAAAA%3D%3D&x-amz-sdk-checksum-algorithm=CRC32&x-id=PutObject",
"key": "uploads/1794578073871-95d30e50-6fc9-4162-a705-caed2360cf5f.png"
}

// -------------------------------- upload PUT fetch call --------------------------------
Request URL - https://ai-memory-image-storage.s3.ap-southeast-2.amazonaws.com/uploads/1794578073871-95d30e50-6fc9-4162-a705-caed2360cf5f.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=AKIAQREPIFGYP57RNVE3%2F20261113%2Fap-southeast-2%2Fs3%2Faws4_request&X-Amz-Date=20261113T135433Z&X-Amz-Expires=60&X-Amz-Signature=599d20750443b59bb97d4c94211fb21ae2406eccd523401cfeebeaeeca153cdb&X-Amz-SignedHeaders=host&x-amz-checksum-crc32=AAAAAA%3D%3D&x-amz-sdk-checksum-algorithm=CRC32&x-id=PutObject
Request method - PUT
Status code - 200 OK
Remote address - 3.5.165.175:443
Referrer policy - strict-origin-when-cross-origin
