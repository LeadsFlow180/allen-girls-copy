import { TeacherLibraryStoryForm } from "@/components/teacher/teacher-library-story-form";

export default function AdminLibraryNewPage() {
  return (
    <div style={{ maxWidth: 920, margin: "0 auto" }}>
      <TeacherLibraryStoryForm mode="create" basePath="/admin/library" />
    </div>
  );
}
