import "server-only";
import { mkdir, readFile, writeFile, unlink } from "node:fs/promises";
import { resolve } from "node:path";
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { getEnv } from "@/config/env";
import { appConfig } from "@/config/app";
import { AppError } from "@/server/http";
export interface StorageAdapter {
  put(key: string, data: Buffer, mime: string): Promise<void>;
  get(key: string): Promise<Uint8Array>;
  remove(key: string): Promise<void>;
}
export function validateFile(data: Uint8Array, mime: string) {
  if (
    !appConfig.upload.types.includes(
      mime as (typeof appConfig.upload.types)[number],
    )
  )
    throw new AppError(422, "Unsupported file type");
  if (data.length === 0 || data.length > appConfig.upload.maxBytes)
    throw new AppError(413, "File must be between 1 byte and 5 MiB");
  const b = Buffer.from(data);
  const ok =
    mime === "image/png"
      ? b.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))
      : mime === "image/jpeg"
        ? b[0] === 255 && b[1] === 216 && b[2] === 255
        : b.subarray(0, 5).toString() === "%PDF-";
  if (!ok)
    throw new AppError(422, "File contents do not match the declared type");
}
export function storage(): StorageAdapter {
  const e = getEnv();
  if (e.STORAGE_PROVIDER === "s3") {
    if (!e.S3_BUCKET) throw new AppError(503, "S3_BUCKET is required");
    const client = new S3Client({
      region: e.S3_REGION,
      endpoint: e.S3_ENDPOINT,
      forcePathStyle: !!e.S3_ENDPOINT,
      ...(e.S3_ACCESS_KEY_ID && e.S3_SECRET_ACCESS_KEY
        ? {
            credentials: {
              accessKeyId: e.S3_ACCESS_KEY_ID,
              secretAccessKey: e.S3_SECRET_ACCESS_KEY,
            },
          }
        : {}),
    });
    return {
      async put(key, data, mime) {
        await client.send(
          new PutObjectCommand({
            Bucket: e.S3_BUCKET,
            Key: key,
            Body: data,
            ContentType: mime,
          }),
        );
      },
      async get(key) {
        const r = await client.send(
          new GetObjectCommand({ Bucket: e.S3_BUCKET, Key: key }),
        );
        if (!r.Body) throw new AppError(404, "File not found");
        return r.Body.transformToByteArray();
      },
      async remove(key) {
        await client.send(
          new DeleteObjectCommand({ Bucket: e.S3_BUCKET, Key: key }),
        );
      },
    };
  }
  const base = resolve(e.STORAGE_PATH);
  function path(key: string) {
    if (!/^[a-f0-9-]{36}$/.test(key))
      throw new AppError(400, "Invalid storage key");
    return resolve(base, key);
  }
  return {
    async put(key, data) {
      await mkdir(base, { recursive: true, mode: 0o700 });
      await writeFile(path(key), data, { flag: "wx", mode: 0o600 });
    },
    async get(key) {
      return readFile(path(key));
    },
    async remove(key) {
      await unlink(path(key));
    },
  };
}
