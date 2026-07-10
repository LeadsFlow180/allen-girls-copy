/** Story Time — open to all roles (home page, parents previewing, guests). */
export const LEARN_LIBRARY_PATH = "/learn/library";

export function isLearnLibraryPath(pathname: string): boolean {
  return pathname === LEARN_LIBRARY_PATH || pathname.startsWith(`${LEARN_LIBRARY_PATH}/`);
}
