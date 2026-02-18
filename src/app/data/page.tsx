import { Header } from "@/components/header";
import { Footer } from "@/components/footer";

export default function DataPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <div className="mx-auto max-w-5xl px-4 py-8">
          <h1 className="text-2xl font-semibold tracking-tight">Data</h1>
          <p className="mt-1 text-muted-foreground">
            View all graded scars and export CSV — coming soon
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
