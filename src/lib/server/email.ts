import { Resend } from 'resend'
import { RESEND_API_KEY, RESEND_FROM_EMAIL } from '$env/static/private'

const resend = new Resend(RESEND_API_KEY)

export async function sendCollaboratorInviteEmail(params: {
  to: string
  treeName: string
  inviterName: string
  acceptUrl: string
}): Promise<boolean> {
  const { to, treeName, inviterName, acceptUrl } = params

  try {
    const { error } = await resend.emails.send({
      from: RESEND_FROM_EMAIL,
      to,
      subject: `${inviterName} invited you to ${treeName} on Prosapia`,
      html: `
        <div style="background:#F7F4EE;padding:48px 24px;font-family:'Plus Jakarta Sans',Helvetica,Arial,sans-serif;">
          <div style="max-width:480px;margin:0 auto;background:#FFFFFF;border-radius:12px;padding:40px;">
            <p style="font-size:12px;letter-spacing:0.3em;text-transform:uppercase;color:#8C7355;margin:0 0 24px;">PROSAPIA</p>
            <p style="font-family:Georgia,'Times New Roman',serif;font-size:20px;line-height:1.7;color:#1C1A17;margin:0 0 16px;">
              ${inviterName} has invited you to help preserve the story of <em>${treeName}</em>.
            </p>
            <p style="font-family:Georgia,'Times New Roman',serif;font-size:16px;line-height:1.7;color:#3D3A35;margin:0 0 32px;">
              Add your own memories, photographs, and the details only you remember — the tree grows every time someone adds their voice.
            </p>
            <a href="${acceptUrl}" style="display:inline-block;background:#1C1A17;color:#F7F4EE;text-decoration:none;padding:12px 24px;border-radius:8px;font-size:14px;font-weight:500;">Accept invitation</a>
            <p style="font-size:12px;color:#7A6F63;margin:32px 0 0;">This invitation expires in 14 days.</p>
          </div>
        </div>
      `,
    })

    return !error
  } catch {
    return false
  }
}
