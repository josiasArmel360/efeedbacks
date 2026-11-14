import * as React from "react";
import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Text,
  Heading,
  Tailwind,
  Hr,
} from "@react-email/components";

interface EmailChangeConfirmationEmailProps {
  userName: string;
  appName: string;
  newEmail: string;
  oldEmail: string;
}

export const EmailChangeConfirmationEmail = ({
  userName,
  appName,
  newEmail,
  oldEmail,
}: EmailChangeConfirmationEmailProps) => {
  return (
    <Html lang="fr" dir="ltr">
      <Tailwind>
        <Head />
        <Body className="bg-gray-50 font-sans py-10">
          <Container className="bg-white rounded-lg shadow-sm border border-gray-200 max-w-[560px] mx-auto overflow-hidden">
            <Section className="py-6 px-8 border-b border-gray-100 bg-amber-50/50">
              <Heading className="text-[20px] font-bold text-gray-900 m-0">
                Alerte de sécurité : Changement d'adresse email
              </Heading>
              <Text className="text-[13px] text-gray-600 m-0 mt-1">
                {appName} • Notification de sécurité
              </Text>
            </Section>

            <Section className="px-8 py-6">
              <Text className="text-[15px] text-gray-700 mb-3 m-0">
                Bonjour <strong>{userName}</strong>,
              </Text>

              <Text className="text-[15px] text-gray-700 leading-6 mb-4 m-0">
                L'adresse email associée à votre compte{" "}
                <strong>{appName}</strong> est en cours de modification.
              </Text>

              <Section className="bg-gray-50 border border-gray-200 p-4 rounded-md mb-4 text-[13px] text-gray-700">
                <Text className="m-0 mb-1">
                  Ancienne adresse :{" "}
                  <span className="font-mono text-gray-900">{oldEmail}</span>
                </Text>
                <Text className="m-0">
                  Nouvelle adresse :{" "}
                  <span className="font-mono font-semibold text-blue-600">
                    {newEmail}
                  </span>
                </Text>
              </Section>

              <Text className="text-[13px] text-gray-600 leading-5 m-0">
                Si vous êtes à l'origine de cette modification, un email de
                confirmation a été envoyé à la nouvelle adresse pour valider
                l'opération. Dans le cas contraire, veuillez contacter sans
                délai votre administrateur d'établissement.
              </Text>
            </Section>

            <Hr className="border-gray-200 my-0" />

            <Section className="px-8 py-6 bg-gray-50/50">
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
