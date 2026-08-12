type OrganizationInvitationTemplateInput = {
  organizationName: string;
  organizationSlug: string;
  roleName: string;
  inviteToken: string;
  expiresAt: Date;
  frontendUrl: string;
};

type OrganizationInvitationTemplate = {
  subject: string;
  html: string;
  text: string;
};

function escapeHtml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function normalizeBaseUrl(url: string) {
  return url.replace(/\/$/, '');
}

function buildAcceptInvitationUrl(frontendUrl: string, inviteToken: string) {
  const url = new URL('/accept-invitation', normalizeBaseUrl(frontendUrl));
  url.searchParams.set('token', inviteToken);
  return url.toString();
}

export function renderOrganizationInvitationEmail(
  input: OrganizationInvitationTemplateInput,
): OrganizationInvitationTemplate {
  const subject = `You have been invited to join ${input.organizationName} on RiskSphere`;
  const appUrl = normalizeBaseUrl(input.frontendUrl);
  const acceptUrl = buildAcceptInvitationUrl(appUrl, input.inviteToken);
  const expiresAt = input.expiresAt.toUTCString();
  const organizationName = escapeHtml(input.organizationName);
  const organizationSlug = escapeHtml(input.organizationSlug);
  const roleName = escapeHtml(input.roleName);
  const inviteToken = escapeHtml(input.inviteToken);
  const acceptLink = escapeHtml(acceptUrl);

  return {
    subject,
    text: [
      `You have been invited to join ${input.organizationName} on RiskSphere.`,
      `Organization: ${input.organizationName} (${input.organizationSlug})`,
      `Role: ${input.roleName}`,
      `Invitation token: ${input.inviteToken}`,
      `Expires: ${expiresAt}`,
      '',
      `Accept your invitation: ${acceptUrl}`,
      `If prompted, sign in with the invited account and then confirm the invitation.`,
      '',
      `If you were not expecting this invitation, you can ignore this email.`,
    ].join('\n'),
    html: `<!doctype html>
<html lang="en">
  <body style="margin:0;background:#f6f7fb;padding:32px;font-family:Arial,sans-serif;color:#1f2937;">
    <div style="max-width:640px;margin:0 auto;background:#ffffff;border:1px solid #e5e7eb;border-radius:16px;padding:32px;">
      <p style="margin:0 0 16px;font-size:14px;letter-spacing:.08em;text-transform:uppercase;color:#6b7280;">RiskSphere</p>
      <h1 style="margin:0 0 16px;font-size:24px;line-height:1.3;color:#111827;">You have been invited to join ${organizationName}</h1>
      <p style="margin:0 0 12px;font-size:16px;line-height:1.6;">Your access level is <strong>${roleName}</strong> for <strong>${organizationName}</strong> (<span style="color:#6b7280;">${organizationSlug}</span>).</p>
      <div style="margin:20px 0;padding:16px 20px;border-radius:12px;background:#f9fafb;border:1px solid #e5e7eb;">
        <div style="font-size:12px;text-transform:uppercase;letter-spacing:.08em;color:#6b7280;margin-bottom:8px;">Invitation token</div>
        <div style="font-size:18px;font-weight:700;letter-spacing:.04em;word-break:break-all;color:#111827;">${inviteToken}</div>
      </div>
      <p style="margin:0 0 8px;font-size:14px;line-height:1.6;color:#6b7280;">Expires: ${escapeHtml(expiresAt)}</p>
      <div style="margin:24px 0;padding:20px;border-radius:14px;background:#eff6ff;border:1px solid #bfdbfe;">
        <p style="margin:0 0 12px;font-size:16px;line-height:1.6;color:#1d4ed8;font-weight:600;">Accept the invitation in RiskSphere</p>
        <p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#1f2937;">Open the invite page below. If prompted, sign in with the invited account and confirm the invitation.</p>
        <p style="margin:0;font-size:15px;line-height:1.6;"><a href="${acceptLink}" style="color:#1d4ed8;text-decoration:none;font-weight:600;">Accept invitation</a></p>
      </div>
      <p style="margin:0 0 24px;font-size:16px;line-height:1.6;">If the button does not work, copy this link: <span style="word-break:break-all;color:#2563eb;">${acceptLink}</span></p>
      <p style="margin:0;font-size:14px;line-height:1.6;color:#6b7280;">If you were not expecting this invitation, you can ignore this email.</p>
    </div>
  </body>
</html>`,
  };
}
