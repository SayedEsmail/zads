import type { Metadata } from "next";
import { notFound } from "next/navigation";

// Only /areas/6th-of-october and /areas/sheikh-zayed exist (static segments win
// over this one). Any other slug renders the localized areas not-found page
// inside the public layout instead of the bare framework 404.
export const metadata: Metadata = { robots: { index: false } };

export default function UnknownAreaPage() {
  notFound();
}
