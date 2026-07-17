export function formatStudentNumber(studentNumber: number): string {
  return String(studentNumber).padStart(3, "0");
}
