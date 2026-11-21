import { expect, test, type Browser, type Page } from "@playwright/test";
import { mkdirSync } from "node:fs";
import { join } from "node:path";
import { CODIGO_EQUIPO, CODIGO_GESTION, cerrarAvisoPrivacidad, ingresar } from "./util";

const CARPETA = join(process.cwd(), "docs", "capturas");

const PANTALLAS_EQUIPO = ["inicio", "acudo", "semaforo", "bitacora", "buzon", "muro", "pulso", "circulos", "ayuda"];
const PANTALLAS_GESTION = [
  "gestion/buzon",
  "gestion/mapa",
  "gestion/circulos",
  "gestion/pulso-roles",
  "gestion/tablero",
  "gestion/tablero/imprimir",
  "gestion/exportar",
  "gestion/ajustes",
];

const VISTAS = [
  { nombre: "movil", viewport: { width: 390, height: 844 } },
  { nombre: "escritorio", viewport: { width: 1280, height: 800 } },
] as const;

function slug(ruta: string) {
  return ruta.replace(/^\//, "").replace(/\//g, "-") || "inicio";
}

async function capturar(page: Page, ruta: string, vista: string) {
  await page.goto(ruta);
  await page.waitForLoadState("networkidle");
  await cerrarAvisoPrivacidad(page);
  await page.screenshot({ path: join(CARPETA, `${slug(ruta)}-${vista}.png`), fullPage: true });
}

async function abrirContexto(browser: Browser, viewport: { width: number; height: number }) {
  return browser.newContext({ viewport, hasTouch: viewport.width < 500, locale: "es-CO", timezoneId: "America/Bogota" });
}

test.beforeAll(() => {
  mkdirSync(CARPETA, { recursive: true });
});

for (const vista of VISTAS) {
  test(`capturas de las pantallas principales · ${vista.nombre}`, async ({ browser }) => {
    const ctx = await abrirContexto(browser, vista.viewport);
    const page = await ctx.newPage();
    try {
      await capturar(page, "/ingresar", vista.nombre);
      await ingresar(page, CODIGO_EQUIPO);
      for (const p of PANTALLAS_EQUIPO) await capturar(page, `/${p}`, vista.nombre);
      await capturar(page, "/privacidad", vista.nombre);

      const gestion = await abrirContexto(browser, vista.viewport);
      const pg = await gestion.newPage();
      await ingresar(pg, CODIGO_GESTION);
      await capturar(pg, "/inicio", `gestion-${vista.nombre}`);
      for (const p of PANTALLAS_GESTION) await capturar(pg, `/${p}`, vista.nombre);
      await gestion.close();
    } finally {
      await ctx.close();
    }
  });
}

test("sin scroll horizontal a 360 px en ninguna pantalla", async ({ browser }) => {
  const ctx = await abrirContexto(browser, { width: 360, height: 740 });
  const page = await ctx.newPage();
  const desbordan: string[] = [];
  async function revisar(ruta: string) {
    await page.goto(ruta);
    await page.waitForLoadState("networkidle");
    await cerrarAvisoPrivacidad(page);
    const { ancho, visible } = await page.evaluate(() => ({
      ancho: document.documentElement.scrollWidth,
      visible: window.innerWidth,
    }));
    if (ancho > visible) desbordan.push(`${ruta} (${ancho} > ${visible})`);
  }
  try {
    for (const r of ["/ingresar", "/privacidad"]) await revisar(r);
    await ingresar(page, CODIGO_EQUIPO);
    for (const p of PANTALLAS_EQUIPO) await revisar(`/${p}`);
    const gestion = await abrirContexto(browser, { width: 360, height: 740 });
    const pg = await gestion.newPage();
    await ingresar(pg, CODIGO_GESTION);
    for (const p of PANTALLAS_GESTION) {
      await pg.goto(`/${p}`);
      await pg.waitForLoadState("networkidle");
      await cerrarAvisoPrivacidad(pg);
      const { ancho, visible } = await pg.evaluate(() => ({ ancho: document.documentElement.scrollWidth, visible: window.innerWidth }));
      if (ancho > visible) desbordan.push(`/${p} (${ancho} > ${visible})`);
    }
    await gestion.close();
  } finally {
    await ctx.close();
  }
  expect(desbordan, "Pantallas con scroll horizontal a 360 px").toEqual([]);
});
