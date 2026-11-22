import { site } from "@/content/site";

/** Yellow "To come" label for anything Victor still needs to supply. */
export function ToCome({ what }: { what?: string }) {
  return <span className="to-come">{what ? `${site.toComeLabel}: ${what}` : site.toComeLabel}</span>;
}
