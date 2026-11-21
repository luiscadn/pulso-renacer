import { describe, expect, it } from "vitest";
import { calcularAnticipacion, enlaceWhatsApp, generarMensaje, hora12, poca } from "./logica";

describe("hora12", () => {
  it("formatea en 12 horas", () => {
    expect(hora12("15:00")).toBe("3:00 p. m.");
    expect(hora12("09:05")).toBe("9:05 a. m.");
    expect(hora12("00:30")).toBe("12:30 a. m.");
    expect(hora12("12:00")).toBe("12:00 p. m.");
  });
});

describe("generarMensaje", () => {
  it("amarillo con iniciales", () => {
    expect(
      generarMensaje({ color: "AMARILLO", cabina: "Cabina 2", horaCita: "15:00", minutosRetraso: 10, motivo: "RETRASO_PACIENTE", accion: "INICIAR_MAS_TARDE", iniciales: "M. R." }),
    ).toBe("🟡 AMARILLO · Cabina 2 · Cita 3:00 p. m. · Paciente M. R. llega ~10 min tarde. Propuesta: iniciar 3:10 p. m. y acortar 10 min. Cabina, confirma con 👍");
  });
  it("verde", () => {
    const m = generarMensaje({ color: "VERDE", cabina: "Láser", horaCita: "10:30", motivo: "OTRO", iniciales: "A. B." });
    expect(m).toBe("🟢 VERDE · Láser · Cita 10:30 a. m. · Paciente A. B. llega a tiempo. Cabina, confirma con 👍");
  });
  it("rojo con reprogramación", () => {
    const m = generarMensaje({ color: "ROJO", cabina: "Cabina 1", horaCita: "16:00", minutosRetraso: 30, motivo: "REPROGRAMACION", accion: "REPROGRAMAR", iniciales: "" });
    expect(m).toBe("🔴 ROJO · Cabina 1 · Cita 4:00 p. m. · La paciente necesita reprogramar la cita. Propuesta: reprogramar. Cabina, confirma con 👍");
  });
  it("sin iniciales no inventa datos", () => {
    const m = generarMensaje({ color: "AMARILLO", cabina: "Cabina 3", horaCita: "14:00", minutosRetraso: 5, motivo: "RETRASO_PACIENTE", accion: "ESPERAR" });
    expect(m).toContain("La paciente llega ~5 min tarde.");
    expect(m).not.toContain("Paciente ");
  });
});

describe("calcularAnticipacion", () => {
  // 2026-11-21 14:00 en Bogotá = 19:00 UTC
  const ahora = new Date("2026-11-21T19:00:00Z");
  it("calcula minutos hasta la cita en Bogotá", () => {
    expect(calcularAnticipacion("15:00", ahora)).toBe(60);
    expect(calcularAnticipacion("14:10", ahora)).toBe(10);
  });
  it("una cita que ya pasó da 0", () => {
    expect(calcularAnticipacion("13:00", ahora)).toBe(0);
  });
  it("usa el día de Bogotá aunque en UTC ya sea otro día", () => {
    // 22:30 en Bogotá = 03:30 UTC del día siguiente
    expect(calcularAnticipacion("23:00", new Date("2026-11-22T03:30:00Z"))).toBe(30);
  });
});

describe("poca anticipación y WhatsApp", () => {
  it("umbral de 15", () => {
    expect(poca(14)).toBe(true);
    expect(poca(15)).toBe(false);
  });
  it("codifica el texto", () => {
    expect(enlaceWhatsApp("a b 👍")).toBe(`https://wa.me/?text=${encodeURIComponent("a b 👍")}`);
  });
});
