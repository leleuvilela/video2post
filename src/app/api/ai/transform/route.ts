import { r2 } from '@/lib/r2'
import { GetObjectCommand } from '@aws-sdk/client-s3'
import chalk from 'chalk'
import { NextResponse } from 'next/server'
import dotenv from 'dotenv'
import axios from 'axios'

dotenv.config()

export async function POST(request: Request) {
  const { videoKey } = await request.json()

  try {
    console.log(chalk.yellow(`Retrieving text from R2: ${videoKey}`))

    const videoText = await r2.send(
      new GetObjectCommand({
        Bucket: process.env.CLOUDFLARE_BUCKET_NAME,
        Key: `${videoKey}.txt`,
      }),
    )

    if (!videoText || !videoText.Body) {
      console.log(chalk.red(`Text not found: ${videoKey}`))
      return NextResponse.error()
    }
    console.log(chalk.yellow(`Transforming text in post: ${videoKey}`))

    const data = {
      model: 'gpt-4-32k',
      messages: [
        {
          content:
            'Transcrever texto para um post de blog em markdownTranscrever texto para um post de blog em markdown, se possível separe os itens por tópicos e utilize cabeçalhos e listas.',
          role: 'function',
          name: 'transform',
        },
        {
          content: await videoText.Body.transformToString(),
          role: 'user',
        },
      ],
    }

    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      data,
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          ContentType: 'application/json',
        },
      },
    )

    const { choices } = response.data

    console.log(chalk.green(`Transcription succeeded!`))

    return NextResponse.json({ message: choices[0]?.message })
  } catch (e) {
    return NextResponse.json(e)
  }
}
