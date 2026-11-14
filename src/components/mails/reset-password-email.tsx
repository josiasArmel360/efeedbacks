import * as React from "react";
import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Text,
  Heading,
  Button,
  Link,
  Hr,
  Tailwind,
} from "@react-email/components";

interface PasswordResetEmailProps {
  userName: string;
  appName: string;
  resetUrl: string;
  expirationTime?: string;
}

export const PasswordResetEmail = ({
  userName,
  appName,
  resetUrl,
  expirationTime = "72 heures",
}: PasswordResetEmailProps) => {
  return (
    <Html lang="fr" dir="ltr">
      <Tailwind>
        <Head />
        <Body className="bg-gray-50 font-sans py-10">
          <Container className="bg-white rounded-lg shadow-sm border border-gray-200 max-w-[600px] mx-auto overflow-hidden">
            <Section className="py-6 px-8 border-b border-gray-100 bg-blue-50/50">
              <Heading className="text-[22px] font-semibold text-gray-900 m-0">
                Réinitialisation de votre mot de passe
              </Heading>
              <Text className="text-[13px] text-gray-600 m-0 mt-1">
                {appName} • Sécurité des accès
              </Text>
            </Section>

            <Section className="px-8 py-6">
              <Text className="text-[16px] text-gray-700 mb-4 m-0">
                Bonjour <strong>{userName}</strong>,
              </Text>

              <Text className="text-[15px] text-gray-700 leading-6 mb-6 m-0">
                Une demande de réinitialisation de mot de passe a été soumise
                pour votre compte utilisateur sur <strong>{appName}</strong>.
                Cliquez sur le bouton ci-dessous pour choisir votre nouveau mot
                de passe.
              </Text>

              <Section className="text-center mb-6">
                <Button
                  href={resetUrl}
                  className="bg-blue-600 text-white px-6 py-3 rounded-md text-[15px] font-medium no-underline inline-block"
                >
                  Réinitialiser mon mot de passe
                </Button>
              </Section>

              <Text className="text-[13px] text-gray-500 mb-6 m-0">
                Si le bouton ne fonctionne pas, copiez et collez le lien
                ci-dessous dans votre navigateur : <br />
                <Link href={resetUrl} className="text-blue-600 break-all">
                  {resetUrl}
                </Link>
              </Text>

              <Text className="text-[13px] text-gray-600 m-0 mb-2">
                Ce lien sécurisé expire dans <strong>{expirationTime}</strong>.
              </Text>

              <Text className="text-[13px] text-gray-500 m-0">
                Si vous n'avez pas demandé cette réinitialisation, veuillez
                ignorer ce message. Votre mot de passe actuel restera inchangé
                et protégé.
              </Text>
            </Section>

            <Hr className="border-gray-200 my-0" />

            <Section className="px-8 py-6 bg-gray-50/50">
              <Text className="text-[13px] text-gray-500 mb-2 m-0">
                Cordialement,
                <br />
                L'équipe technique et support <strong>{appName}</strong>
              </Text>
              <Text className="text-[11px] text-gray-400 m-0">
                © {new Date().getFullYear()} {appName}. Tous droits réservés.
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};
