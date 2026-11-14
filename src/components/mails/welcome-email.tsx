import * as React from "react";
import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Text,
  Heading,
  Hr,
  Tailwind,
} from "@react-email/components";

interface WelcomeEmailProps {
  appName: string;
  userName: string;
  tempPassword?: string;
  loginUrl?: string;
}

export const WelcomeEmail = ({
  appName,
  userName,
  tempPassword,
}: WelcomeEmailProps) => {
  return (
    <Html lang="fr" dir="ltr">
      <Tailwind>
        <Head />
        <Body className="bg-gray-50 font-sans py-10">
          <Container className="bg-white rounded-lg shadow-sm border border-gray-200 max-w-[600px] mx-auto overflow-hidden">
            <Section className="py-6 px-8 border-b border-gray-100 bg-emerald-50/50">
              <Heading className="text-[22px] font-semibold text-gray-900 m-0">
                Bienvenue sur {appName}
              </Heading>
              <Text className="text-[13px] text-gray-600 m-0 mt-1">
                Portail hospitalier de traitement des retours d'expérience & de
                la qualité des soins
              </Text>
            </Section>

            <Section className="px-8 py-6">
              <Text className="text-[16px] text-gray-700 mb-4 m-0">
                Bonjour <strong>{userName}</strong>,
              </Text>

              <Text className="text-[15px] text-gray-700 leading-6 mb-6 m-0">
                Votre compte collaborateur a été créé avec succès sur la
                plateforme <strong>{appName}</strong>. Vous pouvez désormais
                vous connecter pour participer au suivi des avis des usagers et
                à l'amélioration continue des prestations de soins.
              </Text>

              {tempPassword && (
                <Section className="bg-amber-50 border border-amber-200 p-4 rounded-md mb-6">
                  <Text className="text-[13px] font-semibold text-amber-900 mb-1 m-0">
                    Votre mot de passe temporaire :
                  </Text>
                  <Text className="text-[18px] font-mono font-bold text-amber-800 m-0 tracking-wider">
                    {tempPassword}
                  </Text>
                  <Text className="text-[12px] text-amber-700 mt-2 m-0">
                    Par mesure de sécurité, vous serez invité à personnaliser ce
                    mot de passe dès votre première connexion.
                  </Text>
                </Section>
              )}

              <Section className="bg-blue-50/70 border border-blue-100 p-4 rounded-md mb-6">
                <Text className="text-[14px] font-semibold text-gray-900 mb-2 m-0">
                  Quelques conseils pour démarrer :
                </Text>
                <Text className="text-[13px] text-gray-700 mb-1 m-0">
                  1. Confirmez votre adresse email si requis.
                </Text>
                <Text className="text-[13px] text-gray-700 mb-1 m-0">
                  2. Activez l'authentification à double facteur (2FA) dans vos
                  paramètres.
                </Text>
                <Text className="text-[13px] text-gray-700 m-0">
                  3. Consultez les avis récents affectés à votre service.
                </Text>
              </Section>
            </Section>

            <Hr className="border-gray-200 my-0" />

            <Section className="px-8 py-6 bg-gray-50/50">
              <Text className="text-[13px] text-gray-500 mb-2 m-0">
                Cordialement,
                <br />
                La Direction & l'équipe Qualité <strong>{appName}</strong>
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
