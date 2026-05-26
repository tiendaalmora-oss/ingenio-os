import { notFound } from "next/navigation";

export default function RootPage() {
  // Ocultamos la raíz del dominio devolviendo un Error 404
  // para que nadie sepa que aquí hay un panel de control.
  notFound();
}