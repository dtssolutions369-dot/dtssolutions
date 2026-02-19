import { Suspense } from "react";
import AddProductClient from "./AddProductClient";

export const dynamic = "force-dynamic";

export default function AddProductPage() {
  return (
    <Suspense fallback={<div className="p-6">Loading...</div>}>
      <AddProductClient />
    </Suspense>
  );
}
