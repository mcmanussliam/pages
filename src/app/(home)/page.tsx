import Link from "next/link";

export default function HomePage() {
  return (
    <div className="flex flex-col justify-center text-center flex-1 px-6">
      <h1 className="text-3xl font-bold mb-4">Hey, I&apos;m Liam</h1>
      <p className="text-fd-muted-foreground">
        Open{" "}
        <Link href="/docs" className="font-medium underline">
          /docs
        </Link>{" "}
        to browse project documentation.
      </p>
    </div>
  );
}
