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

interface InvitationEmailProps {
  appName: string;
  tenantName: string;
  inviterName?: string;
  roleLabel: string;
  invitationUrl: string;
  expirationHours?: number;
}

export const InvitationEmail = ({
  appName,
  tenantName,
  inviterName,
  roleLabel,
  invitationUrl,
  expirationHours = 72,
}: InvitationEmailProps) => {
  return (
    <Html lang="fr" dir="ltr">
      <Tailwind>
        <Head />
        <Body className="bg-gray-50 font-sans py-10">
          <Container className="bg-white rounded-lg shadow-sm border border-gray-200 max-w-[600px] mx-auto overflow-hidden">
            <Section className="py-6 px-8 border-b border-gray-100 bg-emerald-50/50">
              <Heading className="text-[22px] font-semibold text-gray-900 m-0">
                Invitation à rejoindre {tenantName}
              </Heading>
              <Text className="text-[13px] text-gray-600 mt-1 m-0">
                {appName} • Portail de gestion des retours & avis des usagers
              </Text>
            </Section>

            <Section className="px-8 py-6">
              <Text className="text-[15px] text-gray-700 leading-6 mb-4 m-0">
                {inviterName ? (
                  <React.Fragment>
                    <strong>{inviterName}</strong> vous invite à collaborer au
                    sein de l'établissement <strong>{tenantName}</strong>.
                  </React.Fragment>
                ) : (
                  <React.Fragment>
                    Vous avez été invité à collaborer au sein de l'établissement{" "}
                    <strong>{tenantName}</strong>.
                  </React.Fragment>
                )}
              </Text>

              <Section className="bg-gray-50 border border-gray-200 p-4 rounded-md mb-6">
                <Text className="text-[13px] text-gray-500 m-0 mb-1">
                  Profil attribué :
                </Text>
                <Text className="text-[16px] font-semibold text-gray-900 m-0">
                  {roleLabel}
                </Text>
              </Section>

              <Section className="text-center mb-6">
                <Button
                  href={invitationUrl}
                  className="bg-emerald-600 text-white px-6 py-3 rounded-md text-[15px] font-medium no-underline inline-block"
                >
                  Accepter l'invitation et activer mon compte
                </Button>
              </Section>

              <Text className="text-[13px] text-gray-500 mb-6 m-0">
                Si le bouton ne fonctionne pas, copiez le lien ci-dessous :{" "}
                <br />
                <Link
                  href={invitationUrl}
                  className="text-emerald-600 break-all"
                >
                  {invitationUrl}
                </Link>
              </Text>

              <Text className="text-[13px] text-gray-500 m-0">
                Cette invitation est valable pendant{" "}
                <strong>{expirationHours} heures</strong>.
              </Text>
            </Section>

            <Hr className="border-gray-200 my-0" />

            <Section className="px-8 py-6 bg-gray-50/50">
              <Text className="text-[13px] text-gray-500 mb-2 m-0">
                Cordialement,
                <br />
                L'équipe de coordination <strong>{appName}</strong>
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
