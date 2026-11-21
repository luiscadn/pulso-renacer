import type { Page } from "@playwright/test";

/** Códigos de ingreso. En local son los de `scripts/db-local.sh`; en CI se leen de las variables de entorno. */
export const CODIGO_EQUIPO = process.env.TEAM_CODE ?? "2026";
export const CODIGO_GESTION = process.env.ADMIN_CODE ?? "renacer-gestion";

/** Cierra el aviso de privacidad de primera vez, si aparece. */
export async function cerrarAvisoPrivacidad(page: Page) {
  const entendido = page.getByRole("button", { name: "Entendido", exact: true });
  try {
    await entendido.waitFor({ state: "visible", timeout: 3_000 });
    await entendido.click();
  } catch {
    // Ya se cerró en esta sesión: nada que hacer.
  }
}

/** Ingresa con un código y deja la página lista en /inicio. */
export async function ingresar(page: Page, codigo: string) {
  await page.goto("/ingresar");
  await page.getByLabel("Código de ingreso").fill(codigo);
  await page.getByRole("button", { name: "Entrar", exact: true }).click();
  await page.waitForURL("**/inicio");
  await cerrarAvisoPrivacidad(page);
}

/** Guarda los mensajes de error de la página para revisarlos al final de la prueba. */
export function vigilarConsola(page: Page, errores: string[]) {
  page.on("pageerror", (e) => errores.push(`error de página: ${e.message}`));
  page.on("console", (m) => {
    if (m.type() === "error") errores.push(`consola: ${m.text()}`);
  });
}
