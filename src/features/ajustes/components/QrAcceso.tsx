import { Download } from "lucide-react";
import QRCode from "qrcode";
import { headers } from "next/headers";
import { Card, CardTitle, clasesBoton } from "@/components/ui";

/** URL pública de la app: RENDER_EXTERNAL_URL o el host de la solicitud. El QR NO incluye ningún código de acceso. */
async function urlPublica(): Promise<string> {
  const render = process.env.RENDER_EXTERNAL_URL;
  if (render) return render.replace(/\/$/, "") + "/ingresar";
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  return `${proto}://${host}/ingresar`;
}

export async function QrAcceso() {
  const url = await urlPublica();
  const png = await QRCode.toDataURL(url, { width: 480, margin: 2, color: { dark: "#2F2A26", light: "#FFFFFF" } });
  return (
    <Card className="flex flex-col items-center gap-3 text-center">
      <CardTitle>Compartir acceso al equipo</CardTitle>
      <p className="text-sm text-texto-suave">Quien escanee este código llega a la página de ingreso. El código de acceso se comparte aparte.</p>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={png} alt={`Código QR que lleva a ${url}`} width={240} height={240} className="rounded-xl2 border border-borde" />
      <p className="break-all text-sm">{url}</p>
      <a href={png} download="pulso-renacer-qr.png" className={clasesBoton("secundario")}>
        <Download aria-hidden className="size-5" />
        Descargar QR (PNG)
      </a>
    </Card>
  );
}
