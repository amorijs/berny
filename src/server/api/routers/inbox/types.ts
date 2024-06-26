import { z } from 'zod'

const AttachmentMetaDataSchema = z.object({
  name: z.string(),
  contentType: z.string(),
  contentLength: z.number().int(),
  id: z.string(),
  contentId: z.string().optional(),
})

export const WebhookNewEmailPayloadSchema = z.object({
  messageId: z.string(),
  webhookId: z.string(),
  eventName: z.enum([
    'EMAIL_RECEIVED',
    'NEW_EMAIL',
    'NEW_CONTACT',
    'NEW_ATTACHMENT',
    'EMAIL_OPENED',
    'EMAIL_READ',
    'DELIVERY_STATUS',
    'BOUNCE',
    'BOUNCE_RECIPIENT',
    'NEW_SMS',
  ]),
  webhookName: z.string().optional(),
  inboxId: z.string(),
  domainId: z.string().optional(),
  emailId: z.string(),
  createdAt: z.any(),
  to: z.array(z.string()),
  from: z.string(),
  cc: z.array(z.string()),
  bcc: z.array(z.string()),
  subject: z.string().optional(),
  attachmentMetaDatas: z.array(AttachmentMetaDataSchema),
})
export type WebhookNewEmailPayloadType = z.infer<
  typeof WebhookNewEmailPayloadSchema
>

export const MailSchema = z.object({
  id: z.string(),
  from: z.string(),
  subject: z.string(),
  read: z.boolean(),
  createdAt: z.date(),
})
export type MailType = z.infer<typeof MailSchema>

export const GetMailForInboxOutputSchema = z.object({
  total: z.number(),
  page: z.number(),
  totalPages: z.number(),
  results: z.array(MailSchema),
})
export type GetMailForInboxType = z.infer<typeof GetMailForInboxOutputSchema>
