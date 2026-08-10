import { redirect } from "next/navigation";

// One section, so the root is just a pointer to it.
export default function HomePage() {
  redirect("/announcements");
}
