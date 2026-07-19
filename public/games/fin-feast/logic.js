// No-op solo logic stub — Fin Feast runs entirely client-side in index.html.
export const meta = { name: "Fin Feast", minPlayers: 1, maxPlayers: 1 };
export function setup() { return { started: true }; }
export function validateAction() { return true; }
export function applyAction(state) { return state; }
export function isGameOver() { return false; }
export function viewFor(state) { return state; }
