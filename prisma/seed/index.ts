import { db } from "../../src/lib/db";
import { seedBase } from "./base";
import { seedDemo } from "./demo";

async function main() {
  const conDemo = process.argv.includes("--demo");
  await seedBase();
  console.log("✔ Siembra base lista (ajustes y mapa).");
  if (conDemo) {
    await seedDemo();
    console.log("✔ Datos de demostración cargados (esDemo = true).");
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
