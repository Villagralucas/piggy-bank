import { LoginForm } from "./login-form";

const CONFIRM_ERROR =
  "No pudimos confirmar tu correo con ese enlace. Probá iniciar sesión; si no te deja, registrate de nuevo para recibir otro mail.";

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const { error } = await searchParams;
  return <LoginForm initialError={error === "confirm" ? CONFIRM_ERROR : null} />;
}
