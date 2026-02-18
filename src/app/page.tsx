import Link from "next/link";
import { Eye, ClipboardList, BarChart3, Database } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";

const features = [
  {
    icon: ClipboardList,
    title: "6-Step Grading",
    description:
      "Stepwise unblinding: fundus → predict OCT → AF → revise → actual OCT → confirm",
    href: "/grade",
  },
  {
    icon: Database,
    title: "Data Management",
    description:
      "View all graded scars, filter by patient or group, export SPSS-formatted CSV",
    href: "/data",
  },
  {
    icon: BarChart3,
    title: "Statistics Preview",
    description:
      "Cross-tables, Spearman's rho, Mann-Whitney — preview before SPSS confirmation",
    href: "/statistics",
  },
];

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1">
        {/* Hero */}
        <section className="mx-auto max-w-5xl px-4 py-16 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <Eye className="h-6 w-6 text-primary" />
          </div>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
            PRP Scar Grading Tool
          </h1>
          <p className="mt-2 text-lg text-muted-foreground">
            Multimodal characterization of PRP laser scars
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Can fundus photography predict retinal penetration depth?
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Button asChild>
              <Link href="/grade">Start Grading</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/data">View Data</Link>
            </Button>
          </div>
        </section>

        {/* Feature cards */}
        <section className="mx-auto max-w-5xl px-4 pb-16">
          <div className="grid gap-4 sm:grid-cols-3">
            {features.map((feature) => (
              <Link key={feature.href} href={feature.href}>
                <Card className="h-full transition-colors hover:bg-muted/50">
                  <CardHeader>
                    <feature.icon className="h-5 w-5 text-muted-foreground" />
                    <CardTitle className="text-base">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription>{feature.description}</CardDescription>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>

        {/* Study info */}
        <section className="border-t bg-muted/30">
          <div className="mx-auto max-w-5xl px-4 py-8">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Study Design
            </h2>
            <div className="mt-3 grid gap-4 text-sm sm:grid-cols-2">
              <div>
                <p className="font-medium">Group A — Modern Laser</p>
                <p className="text-muted-foreground">
                  Valon / Navilas — 3-4 patients, 3-5 scars each
                </p>
              </div>
              <div>
                <p className="font-medium">Group B — Conventional Laser</p>
                <p className="text-muted-foreground">
                  Argon — 3-4 patients, 3-5 scars each
                </p>
              </div>
            </div>
            <p className="mt-3 text-xs text-muted-foreground">
              20-40 total scars &bull; Color fundus (primary) &bull; AF 532nm
              (complement) &bull; OCT (reference standard)
            </p>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
