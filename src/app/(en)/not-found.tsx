import { appearance } from "./not-found.styles";
import { ButtonLink } from "@/components/button-link";

export default function NotFound() {
  return (
    <main className={appearance["not-found"]} id="main-content" tabIndex={-1}>
      <span>404</span>
      <h1>Nothing invested here.</h1>
      <ButtonLink href="/">Return home</ButtonLink>
    </main>
  );
}
