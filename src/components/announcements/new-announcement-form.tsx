"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { apiPost } from "@/lib/api/client";
import { announcementCategories } from "@/lib/db/schema";
import {
  BODY_MAX,
  TITLE_MAX,
  createAnnouncementSchema,
} from "@/lib/validation/announcements";
import { fieldErrorsFromZod } from "@/lib/validation/errors";

type FieldErrors = Partial<Record<"title" | "body" | "category", string[]>>;

// Rendered only for admins, but the API enforces the role independently.
// On success, router.refresh() re-runs the server component that owns the list,
// so the new item arrives from the database rather than client state.
export function NewAnnouncementForm() {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);

  const [category, setCategory] = useState<string>("general");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFieldErrors({});

    const formData = new FormData(event.currentTarget);
    const parsed = createAnnouncementSchema.safeParse({
      title: String(formData.get("title") ?? ""),
      body: String(formData.get("body") ?? ""),
      category,
    });

    if (!parsed.success) {
      setFieldErrors(fieldErrorsFromZod(parsed.error));
      return;
    }

    setIsSubmitting(true);
    const result = await apiPost("/api/announcements", parsed.data);
    setIsSubmitting(false);

    if (!result.ok) {
      setFieldErrors(result.fields ?? {});
      toast.error(result.message);
      return;
    }

    formRef.current?.reset();
    setCategory("general");
    toast.success("Announcement posted");
    router.refresh();
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Post an announcement</CardTitle>
        <CardDescription>Everyone signed in to the portal will see this.</CardDescription>
      </CardHeader>

      <CardContent>
        <form ref={formRef} onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              name="title"
              maxLength={TITLE_MAX}
              placeholder="Short, specific summary"
              disabled={isSubmitting}
              aria-invalid={Boolean(fieldErrors.title)}
              aria-describedby={fieldErrors.title ? "title-error" : undefined}
            />
            {fieldErrors.title ? (
              <p id="title-error" className="text-sm text-destructive">
                {fieldErrors.title[0]}
              </p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            {/* Radix Select renders no native input, so this one field is held
                in state and merged into the payload on submit. */}
            <Select
              value={category}
              onValueChange={setCategory}
              disabled={isSubmitting}
            >
              <SelectTrigger id="category" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {announcementCategories.map((option) => (
                  <SelectItem key={option} value={option} className="capitalize">
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="body">Details</Label>
            <Textarea
              id="body"
              name="body"
              rows={4}
              maxLength={BODY_MAX}
              placeholder="What does the team need to know?"
              disabled={isSubmitting}
              aria-invalid={Boolean(fieldErrors.body)}
              aria-describedby={fieldErrors.body ? "body-error" : undefined}
            />
            {fieldErrors.body ? (
              <p id="body-error" className="text-sm text-destructive">
                {fieldErrors.body[0]}
              </p>
            ) : null}
          </div>

          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Posting…" : "Post announcement"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
