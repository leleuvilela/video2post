import { MainForm } from '@/components/Form'

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4">
      <h1 className="text-xl font-semibold">Video 2 Post</h1>

      <div className="flex w-full max-w-xl flex-col gap-4 rounded-lg bg-zinc-50 p-6 shadow">
        <MainForm />
      </div>
    </main>
  )
}
