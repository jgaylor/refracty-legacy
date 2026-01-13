import { Button } from "@/components/Button/Button";

export default function ButtonDemoPage() {
  return (
    <main style={{ padding: 24 }}>
      <Button variant="primary">Primary button</Button>
      <div style={{ height: 16 }} />
      <Button variant="secondary">Secondary button</Button>
    </main>
  );
}
