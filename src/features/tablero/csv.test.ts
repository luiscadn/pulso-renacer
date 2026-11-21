import { describe, expect, it } from "vitest";
import { aCsv, BOM } from "./csv";

describe("aCsv", () => {
  it("empieza con BOM UTF-8 y usa CRLF", () => {
    const s = aCsv(["Año", "Nota"], [["2026", "hola"]]);
    expect(s.startsWith(BOM)).toBe(true);
    expect(s).toBe(`${BOM}Año,Nota\r\n2026,hola\r\n`);
  });
  it("entrecomilla comas, comillas y saltos de línea", () => {
    expect(aCsv(["a"], [['dijo "hola", ¿sí?\nfin']])).toContain('"dijo ""hola"", ¿sí?\nfin"');
  });
  it("traduce booleanos y vacíos", () => {
    expect(aCsv(["a", "b", "c"], [[true, null, false]])).toContain("Sí,,No");
  });
  it("neutraliza fórmulas pero deja pasar números negativos", () => {
    const s = aCsv(["a"], [["=SUMA(A1)"], ["@cmd"], ["-5"], ["+57 300"]]);
    expect(s).toContain("'=SUMA(A1)");
    expect(s).toContain("'@cmd");
    expect(s).toContain("\r\n-5\r\n");
    expect(s).toContain("'+57 300");
  });
});
