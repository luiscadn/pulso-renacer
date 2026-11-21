import { expect, test } from "@playwright/test";
import { readFileSync } from "node:fs";
import { CODIGO_EQUIPO, CODIGO_GESTION, cerrarAvisoPrivacidad, ingresar, vigilarConsola } from "./util";

/** Hora (HH:MM, Bogotá) dentro de N minutos: el aviso del semáforo debe tener anticipación. */
function horaDentro(minutos: number) {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: "America/Bogota",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).format(new Date(Date.now() + minutos * 60_000));
}

test("recorrido completo: equipo (móvil) y gestión", async ({ browser }) => {
  // Marca única para encontrar la propuesta en la bandeja y en el muro sin tocar datos reales.
  const marca = `E2E ${new Date().toISOString().slice(11, 19)}`;
  const textoPropuesta = `Prueba ${marca}: revisar la limpieza de camillas entre pacientes con un protocolo de bioseguridad.`;
  const resumenPublico = `Se revisará la limpieza de camillas entre pacientes (${marca}).`;
  const respuesta = `Ya quedó (${marca}): el protocolo de limpieza de camillas se agregó al kit de cabina.`;
  const errores: string[] = [];

  const ctxEquipo = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, locale: "es-CO", timezoneId: "America/Bogota" });
  const ctxGestion = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, locale: "es-CO", timezoneId: "America/Bogota" });
  const equipo = await ctxEquipo.newPage();
  const gestion = await ctxGestion.newPage();
  vigilarConsola(equipo, errores);
  vigilarConsola(gestion, errores);

  try {
    await test.step("equipo: ingresa con el código del equipo", async () => {
      await ingresar(equipo, CODIGO_EQUIPO);
      await expect(equipo).toHaveURL(/\/inicio$/);
    });

    // Foto del tablero antes de cualquier registro, para comprobar después que cambió.
    await test.step("gestión: ingresa y toma la foto inicial del tablero", async () => {
      await ingresar(gestion, CODIGO_GESTION);
      await gestion.goto("/gestion/tablero");
      await expect(gestion.getByRole("heading", { level: 1 })).toBeVisible();
    });
    const tableroAntes = await gestion.locator("main").innerText();

    await test.step("equipo: abre una consulta en 3 toques", async () => {
      await equipo.goto("/bitacora");
      await equipo.getByRole("tab", { name: "Nueva" }).click();
      const panel = equipo.getByRole("tabpanel");
      await panel.getByText("Cabina", { exact: true }).click();
      await panel.getByText("Agenda", { exact: true }).click();
      await panel.getByText("Administradora", { exact: true }).click();
      await expect(equipo.getByText("Consulta abierta", { exact: true })).toBeVisible();
    });

    await test.step("equipo: cierra la consulta", async () => {
      await equipo.getByRole("tab", { name: /^Abiertas/ }).click();
      const tarjeta = equipo.getByRole("listitem").filter({ hasText: "se dirigió a Administradora" }).first();
      await tarjeta.getByRole("button", { name: "Cerrar", exact: true }).click();
      const dialogo = equipo.getByRole("dialog", { name: "Cerrar la consulta" });
      await dialogo.locator("fieldset").nth(0).getByText("Sí", { exact: true }).click(); // ¿Recibió respuesta?
      await dialogo.locator("fieldset").nth(1).getByText("Rol delegado", { exact: true }).click(); // ¿Quién decidió?
      await dialogo.locator("fieldset").nth(2).getByText("No", { exact: true }).click(); // ¿Se escaló?
      await dialogo.getByRole("button", { name: "Cerrar consulta", exact: true }).click();
      await expect(equipo.getByText("Consulta cerrada. ¡Gracias por registrarla!")).toBeVisible();
    });

    await test.step("equipo: envía un aviso de semáforo (amarillo) y lo registra al copiarlo", async () => {
      await equipo.goto("/semaforo");
      await equipo.getByText("Amarillo", { exact: true }).click();
      await equipo.getByLabel("Hora de la cita").fill(horaDentro(60));
      await equipo.getByLabel("Minutos de retraso").fill("10");
      await equipo.getByRole("button", { name: "Generar aviso", exact: true }).click();
      await expect(equipo.getByRole("heading", { name: "Así quedó tu aviso" })).toBeVisible();
      await equipo.getByRole("button", { name: /Copiar/ }).click();
      await expect(equipo.getByText("Listo, quedó registrado el aviso.")).toBeVisible();
    });

    await test.step("equipo: propone una mejora en el buzón", async () => {
      await equipo.goto("/buzon");
      await equipo.getByText("Protocolos", { exact: true }).click();
      await equipo.getByLabel("Cuéntanos tu idea").fill(textoPropuesta);
      await equipo.getByRole("button", { name: "Enviar propuesta", exact: true }).click();
      await expect(equipo.getByText(/Recibimos tu propuesta/)).toBeVisible();
    });

    await test.step("equipo: responde el pulso semanal", async () => {
      await equipo.goto("/pulso");
      const valores = [4, 4, 3, 4, 3, 4];
      for (const [i, valor] of valores.entries()) {
        await equipo.locator(`label:has(input[name="p${i + 1}"][value="${valor}"])`).click();
      }
      await equipo.getByRole("button", { name: "Enviar mis respuestas", exact: true }).click();
      // Tras guardar, la página se revalida y muestra «Ya respondiste… ¡Gracias!» (o el mensaje de gracias, según el orden).
      await expect(equipo.getByText(/¡Gracias/)).toBeVisible();
    });

    await test.step("gestión: responde y publica la propuesta, y la ve en el muro", async () => {
      await gestion.goto("/gestion/buzon?f=pendientes");
      const tarjeta = gestion.getByRole("listitem").filter({ hasText: marca }).first();
      await tarjeta.locator("summary").click();
      await tarjeta.getByLabel("Estado").selectOption({ label: "Implementada" });
      await tarjeta.getByLabel("Resumen público", { exact: false }).fill(resumenPublico);
      await tarjeta.getByLabel("Respuesta", { exact: true }).fill(respuesta);
      await tarjeta.getByLabel("Publicar en el muro").check();
      await tarjeta.getByRole("button", { name: "Guardar", exact: true }).click();
      // La tarjeta sale de «Pendientes» al guardar: la confirmación la muestra la bandeja, no la tarjeta.
      await expect(gestion.getByText("Listo, guardamos la respuesta.")).toBeVisible();

      await gestion.goto("/muro");
      await expect(gestion.getByText(resumenPublico)).toBeVisible();
      await expect(gestion.getByText(respuesta)).toBeVisible();
    });

    await test.step("gestión: registra un acta del círculo", async () => {
      await gestion.goto("/gestion/circulos");
      await gestion.getByLabel("Qué funcionó", { exact: true }).fill(`Prueba ${marca}: el aviso del semáforo redujo llamadas.`);
      await gestion.getByLabel("Qué se trabó", { exact: true }).fill("Los sábados se juntan dos citas en la misma cabina.");
      await gestion.getByLabel("Cómo está la carga", { exact: true }).fill("Moderada entre semana.");
      await gestion.getByLabel("Qué acordamos", { exact: true }).fill("Revisar la agenda del sábado los viernes.");
      await gestion.getByRole("button", { name: /^Guardar (acta|cambios)$/ }).click();
      await expect(gestion.getByText(/Acta (guardada|actualizada)\./)).toBeVisible();
    });

    await test.step("gestión: el tablero cambió", async () => {
      await gestion.goto("/gestion/tablero");
      await expect(gestion.getByRole("heading", { level: 1 })).toBeVisible();
      const tableroDespues = await gestion.locator("main").innerText();
      expect(tableroDespues).not.toBe(tableroAntes);
    });

    await test.step("gestión: descarga un CSV con BOM UTF-8", async () => {
      await gestion.goto("/gestion/exportar");
      const [descarga] = await Promise.all([
        gestion.waitForEvent("download"),
        gestion.getByRole("link", { name: /CSV de Consultas/ }).click(),
      ]);
      expect(descarga.suggestedFilename()).toMatch(/\.csv$/i);
      const contenido = readFileSync((await descarga.path()) as string, "utf8");
      expect(contenido.startsWith("﻿")).toBe(true);
    });

    expect(errores, "No debe haber errores en consola durante el recorrido").toEqual([]);
  } finally {
    await ctxEquipo.close();
    await ctxGestion.close();
  }
});

test("el aviso de privacidad se muestra una sola vez por sesión", async ({ browser }) => {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, locale: "es-CO", timezoneId: "America/Bogota" });
  const page = await ctx.newPage();
  try {
    await ingresar(page, CODIGO_EQUIPO);
    await page.reload();
    await cerrarAvisoPrivacidad(page); // no debe bloquear nada si ya está aceptado
    await expect(page.getByRole("button", { name: "Entendido", exact: true })).toHaveCount(0);
  } finally {
    await ctx.close();
  }
});
