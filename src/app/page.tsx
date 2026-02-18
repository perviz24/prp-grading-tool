export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 p-8">
      <div className="text-center">
        <h1 className="text-3xl font-semibold tracking-tight">
          PRP Scar Grading Tool
        </h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Multimodal characterization of PRP laser scars
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          Can fundus photography predict retinal penetration depth?
        </p>
      </div>
      <p className="text-sm text-muted-foreground">
        Setting up authentication... Provide Clerk API keys to continue.
      </p>
    </div>
  );
}
