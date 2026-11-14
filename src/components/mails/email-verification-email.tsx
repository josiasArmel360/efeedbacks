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
  Hr,
  Tailwind,
  Link,
} from "@react-email/components";

interface EmailVerificationEmailProps {
  userName: string;
  appName: string;
  verifyUrl: string;
  expirationTime?: string;
}

export const EmailVerificationEmail = ({
  userName,
  appName,
  verifyUrl,
  expirationTime = "72 heures",
}: EmailVerificationEmailProps) => {
  return (
    <Html lang="fr" dir="ltr">
      <Tailwind>
        <Head />
        <Body className="bg-gray-50 font-sans py-10">
          <Container className="bg-white rounded-lg shadow-sm border border-gray-200 max-w-[600px] mx-auto overflow-hidden">
            <Section className="py-6 px-8 border-b border-gray-100 bg-emerald-50/50">
              <Heading className="text-[22px] font-semibold text-gray-900 m-0">
                Confirmation de votre adresse email
              </Heading>
              <Text className="text-[13px] text-gray-600 m-0 mt-1">
                {appName} • Portail de gouvernance de la qualité des soins
              </Text>
            </Section>

            <Section className="px-8 py-6">
              <Text className="text-[16px] text-gray-700 mb-4 m-0">
                Bonjour <strong>{userName}</strong>,
              </Text>

              <Text className="text-[15px] text-gray-700 leading-6 mb-6 m-0">
                Votre compte a été initialisé sur la plateforme{" "}
                <strong>{appName}</strong>. Pour activer vos accès et sécuriser
                vos échanges, veuillez confirmer votre adresse email en cliquant
                sur le bouton ci-dessous.
              </Text>

              <Section className="text-center mb-6">
                <Button
                  href={verifyUrl}
                  className="bg-emerald-600 text-white px-6 py-3 rounded-md text-[15px] font-medium no-underline inline-block"
                >
                  Confirmer mon adresse email
                </Button>
              </Section>

              <Text className="text-[13px] text-gray-500 mb-6 m-0">
                Si le bouton ne fonctionne pas, copiez et collez le lien suivant
                dans votre navigateur : <br />
                <Link href={verifyUrl} className="text-emerald-600 break-all">
                  {verifyUrl}
                </Link>
              </Text>

              <Text className="text-[13px] text-gray-500 m-0">
                Ce lien est valable <strong>{expirationTime}</strong>. Si vous
                n'êtes pas concerné par cette démarche, vous pouvez ignorer cet
                email en toute sécurité.
              </Text>
            </Section>

            <Hr className="border-gray-200 my-0" />

            <Section className="px-8 py-6 bg-gray-50/50">
              <Text className="text-[13px] text-gray-500 mb-2 m-0">
                Cordialement,
                <br />
                L'équipe qualité et sécurité <strong>{appName}</strong>
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
