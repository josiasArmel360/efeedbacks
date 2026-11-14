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

interface TwoFactorOtpEmailProps {
  userName: string;
  appName: string;
  otp: string;
  expirationMinutes?: number;
}

export const TwoFactorOtpEmail = ({
  userName,
  appName,
  otp,
  expirationMinutes = 10,
}: TwoFactorOtpEmailProps) => {
  return (
    <Html lang="fr" dir="ltr">
      <Tailwind>
        <Head />
        <Body className="bg-gray-50 font-sans py-10">
          <Container className="bg-white rounded-lg shadow-sm border border-gray-200 max-w-[560px] mx-auto overflow-hidden">
            <Section className="py-6 px-8 border-b border-gray-100 bg-blue-50/50">
              <Heading className="text-[22px] font-bold text-gray-900 m-0">
                Code de vérification de sécurité (2FA)
              </Heading>
              <Text className="text-[13px] text-gray-600 m-0 mt-1">
                {appName} • Authentification à double facteur
              </Text>
            </Section>

            <Section className="px-8 py-6">
              <Text className="text-[15px] text-gray-700 mb-3 m-0">
                Bonjour <strong>{userName}</strong>,
              </Text>

              <Text className="text-[15px] text-gray-700 leading-6 mb-6 m-0">
                Voici votre code de sécurité temporaire pour finaliser votre
                connexion à votre espace <strong>{appName}</strong>.
              </Text>

              <Section className="text-center my-6 py-5 bg-gray-50 rounded-lg border border-gray-200">
                <Text className="text-[12px] font-semibold text-gray-500 uppercase tracking-wider m-0 mb-2">
                  Code à usage unique
                </Text>
                <Text className="text-[34px] font-mono font-bold tracking-[8px] text-blue-600 m-0 select-all">
                  {otp}
                </Text>
                <Text className="text-[12px] text-gray-500 m-0 mt-2">
                  Valide pendant {expirationMinutes} minutes
                </Text>
              </Section>

              <Text className="text-[13px] text-gray-600 leading-5 m-0 mb-4">
                Ne partagez jamais ce code. Les administrateurs de {appName} ne
                vous demanderont jamais ce code par téléphone ou par message.
              </Text>
            </Section>

            <Hr className="border-gray-200 my-0" />

            <Section className="px-8 py-6 bg-gray-50/50">
              <Text className="text-[12px] text-gray-400 leading-4 m-0">
                Ce message a été généré automatiquement par la plateforme{" "}
                {appName}. Si vous n'avez pas initié cette tentative de
                connexion, modifiez immédiatement votre mot de passe.
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};
