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

interface AccountDeletionConfirmationEmailProps {
  userName: string;
  appName: string;
}

export const AccountDeletionConfirmationEmail = ({
  userName,
  appName,
}: AccountDeletionConfirmationEmailProps) => {
  return (
    <Html lang="fr" dir="ltr">
      <Tailwind>
        <Head />
        <Body className="bg-gray-50 font-sans py-10">
          <Container className="bg-white rounded-lg shadow-sm border border-gray-200 max-w-[560px] mx-auto overflow-hidden">
            <Section className="py-6 px-8 border-b border-gray-100 bg-red-50/50">
              <Heading className="text-[20px] font-bold text-gray-900 m-0">
                Suppression de votre compte
              </Heading>
              <Text className="text-[13px] text-gray-600 m-0 mt-1">
                {appName} • Clôture d'accès
              </Text>
            </Section>

            <Section className="px-8 py-6">
              <Text className="text-[15px] text-gray-700 mb-3 m-0">
                Bonjour <strong>{userName}</strong>,
              </Text>

              <Text className="text-[15px] text-gray-700 leading-6 mb-4 m-0">
                Nous vous confirmons que votre compte utilisateur sur la
                plateforme <strong>{appName}</strong> a été supprimé ou
                désactivé conformément à votre demande ou aux consignes de la
                direction de votre établissement.
              </Text>

              <Text className="text-[13px] text-gray-600 leading-5 m-0">
                Vos sessions actives ont été révoquées. Pour toute question ou
                demande de réactivation, rapprochez-vous de l'administrateur
                principal de votre établissement.
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
