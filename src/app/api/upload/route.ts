import chalk from 'chalk'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { r2 } from '@/lib/r2'
import { PutObjectCommand } from '@aws-sdk/client-s3'
import { NextResponse } from 'next/server'
import dotenv from 'dotenv'

dotenv.config()

export async function POST(request: Request) {
  const { videoId } = await request.json()

  try {
    console.log(chalk.yellow(`Generating signed URL for ${videoId}.mp4`))

    const signedUrl = await getSignedUrl(
      r2,
      new PutObjectCommand({
        Bucket: process.env.CLOUDFLARE_BUCKET_NAME,
        Key: `${videoId}.mp4`,
      }),
      { expiresIn: 60 },
    )

    console.log(chalk.green(`Signed URL generated for ${videoId}.mp4`))

    return NextResponse.json({ url: signedUrl })
  } catch (e) {
    console.error(e)
    return NextResponse.error()
  }
}
